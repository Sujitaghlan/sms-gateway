
jest.mock("../services/smsService", () => ({
  tryProviders: jest.fn(),
}));

const request = require("supertest");
const { app } = require("../index");
const { sequelize, User, Wallet, SmsLog } = require("../models");
const { tryProviders } = require("../services/smsService");

describe("SMS refund when all providers fail", () => {
  let userId;
  let token;

  const email = `refund-test-${Date.now()}@example.com`;
  const password = "TestPass123!";

  beforeAll(async () => {
    await sequelize.authenticate();

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Refund Test User",
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
  });

  afterAll(async () => {
    await SmsLog.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  test("refunds credits when every provider fails", async () => {
    tryProviders.mockResolvedValue({
      success: false,
      provider: null,
      attempts: [],
    });

    const response = await request(app)
      .post("/api/sms/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumbers: ["9841234567"],
        message: "Refund test",
      });

    expect(response.status).toBe(502);
    expect(response.body.creditsRefunded).toBe(1);

    const wallet = await Wallet.findOne({ where: { userId } });
    expect(wallet.balance).toBe(10);

    const failedLog = await SmsLog.findOne({
      where: {
        userId,
        phoneNumber: "9841234567",
        status: "failed",
      },
      order: [["createdAt", "DESC"]],
    });

    expect(failedLog).not.toBeNull();
    expect(failedLog.creditsCharged).toBe(0);
  });
});
