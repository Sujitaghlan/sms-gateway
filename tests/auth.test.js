
const request = require("supertest");
const { app } = require("../index");
const { sequelize, User, Wallet } = require("../models");

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe("Authentication API", () => {
  const testEmail = `jest-${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  test("registers a new user and creates a wallet", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Jest Test User",
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(201);

    const user = await User.findOne({
      where: { email: testEmail },
    });

    expect(user).not.toBeNull();

    const wallet = await Wallet.findOne({
      where: { userId: user.id },
    });

    expect(wallet).not.toBeNull();
    expect(wallet.balance).toBe(100);
  });

  test("logs in the registered user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });
});
