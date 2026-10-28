
jest.mock("../services/smsService", () => ({
  tryProviders: jest.fn(),
}));

const request = require("supertest");
const { app } = require("../index");
const {
  sequelize,
  User,
  Wallet,
  SmsLog,
  SmsProvider,
} = require("../models");
const { tryProviders } = require("../services/smsService");

describe("SMS provider failover", () => {
  let token;
  let userId;
  let providerC;

  const email = `failover-test-${Date.now()}@example.com`;
  const password = "TestPass123!";

  beforeAll(async () => {
    await sequelize.authenticate();

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Failover Test User",
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    token = loginResponse.body.token;

    const user = await User.findOne({ where: { email } });
    userId = user.id;

    await Wallet.update(
      { balance: 10 },
      { where: { userId } }
    );

    providerC = await SmsProvider.findOne({
      where: { name: "Provider C" },
    });

    expect(providerC).not.toBeNull();
  });

  afterAll(async () => {
    await SmsLog.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  test("uses Provider C after earlier providers fail", async () => {
    const providerA = await SmsProvider.findOne({
      where: { name: "Provider A" },
    });
    const providerB = await SmsProvider.findOne({
      where: { name: "Provider B" },
    });

    tryProviders.mockResolvedValue({
      success: true,
      provider: providerC,
      attempts: [
        {
          providerId: providerA.id,
          providerName: providerA.name,
          success: false,
          error: "Simulated provider failure",
        },
        {
          providerId: providerB.id,
          providerName: providerB.name,
          success: false,
          error: "Simulated provider failure",
        },
        {
          providerId: providerC.id,
          providerName: providerC.name,
          success: true,
          error: null,
        },
      ],
    });

    const response = await request(app)
      .post("/api/sms/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumbers: ["9841234567"],
        message: "Failover test",
      });

    expect(response.status).toBe(200);
    expect(response.body.provider).toBe("Provider C");
    expect(tryProviders).toHaveBeenCalledTimes(1);

    const log = await SmsLog.findOne({
      where: {
        userId,
        phoneNumber: "9841234567",
        message: "Failover test",
      },
      order: [["createdAt", "DESC"]],
    });

    expect(log).not.toBeNull();
    expect(log.status).toBe("sent");
    expect(log.providerName).toBe("Provider C");
    expect(log.providerId).toBe(providerC.id);
  });
});
