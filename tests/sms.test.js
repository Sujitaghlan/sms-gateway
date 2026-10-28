
const request = require("supertest");
const { app } = require("../index");
const { sequelize, User, Wallet } = require("../models");

describe("SMS API wallet protection", () => {
  let token;
  let userId;

  const email = `sms-test-${Date.now()}@example.com`;
  const password = "TestPass123!";

  beforeAll(async () => {
    await sequelize.authenticate();

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "SMS Test User",
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
      { balance: 0 },
      { where: { userId } }
    );
  });

  afterAll(async () => {
    await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  test("rejects SMS when wallet has zero credits", async () => {
    const response = await request(app)
      .post("/api/sms/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumbers: ["9841234567"],
        message: "Wallet test",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/insufficient/i);

    const wallet = await Wallet.findOne({ where: { userId } });
    expect(wallet.balance).toBe(0);
  });
});
