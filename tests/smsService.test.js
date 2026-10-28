
jest.mock("../models", () => ({
  sequelize: {
    transaction: jest.fn(async (callback) => {
      return callback({
        LOCK: { UPDATE: "UPDATE" },
      });
    }),
  },
  SmsProvider: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  ProviderAttempt: {
    create: jest.fn(),
  },
}));

const { SmsProvider, ProviderAttempt } = require("../models");
const { tryProviders } = require("../services/smsService");

// Create mock providers with a save method.
function makeProvider(id, name, priority, balance, failureRate) {
  return {
    id,
    name,
    priority,
    balance,
    failureRate,
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
  };
}

// Configure the mocked database queries.
function mockProviders(providers) {
  SmsProvider.findAll.mockResolvedValue(providers);

  SmsProvider.findByPk.mockImplementation(async (id) =>
    providers.find((provider) => provider.id === id)
  );
}

describe("Actual provider failover loop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, "random");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("tries providers in priority order and stops at first success", async () => {
    const providers = [
      makeProvider(1, "Provider A", 1, 100, 0.3),
      makeProvider(2, "Provider B", 2, 100, 0.15),
      makeProvider(3, "Provider C", 3, 100, 0.05),
    ];

    mockProviders(providers);

    // A and B fail; C succeeds.
    Math.random
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9);

    const result = await tryProviders();

    expect(result.success).toBe(true);
    expect(result.provider.name).toBe("Provider C");

    expect(ProviderAttempt.create).toHaveBeenCalledTimes(3);

    expect(
      ProviderAttempt.create.mock.calls.map(([attempt]) => ({
        providerName: attempt.providerName,
        success: attempt.success,
      }))
    ).toEqual([
      { providerName: "Provider A", success: false },
      { providerName: "Provider B", success: false },
      { providerName: "Provider C", success: true },
    ]);

    expect(result.attempts).toHaveLength(3);
    expect(providers[2].save).toHaveBeenCalledTimes(1);
    expect(providers[2].balance).toBe(99);
  });

  test("skips providers with empty balances", async () => {
    const providers = [
      makeProvider(1, "Provider A", 1, 0, 0),
      makeProvider(2, "Provider B", 2, 100, 0),
    ];

    mockProviders(providers);
    Math.random.mockReturnValue(0.9);

    const result = await tryProviders();

    expect(result.success).toBe(true);
    expect(result.provider.name).toBe("Provider B");

    expect(ProviderAttempt.create).toHaveBeenCalledTimes(2);

    expect(ProviderAttempt.create.mock.calls[0][0]).toMatchObject({
      providerName: "Provider A",
      success: false,
      errorMessage: "Provider has insufficient balance or is inactive",
    });

    expect(providers[0].save).not.toHaveBeenCalled();
    expect(providers[1].save).toHaveBeenCalledTimes(1);
    expect(providers[1].balance).toBe(99);
  });

  test("returns failure when every provider fails", async () => {
    const providers = [
      makeProvider(1, "Provider A", 1, 100, 1),
      makeProvider(2, "Provider B", 2, 100, 1),
    ];

    mockProviders(providers);
    Math.random.mockReturnValue(0.5);

    const result = await tryProviders();

    expect(result.success).toBe(false);
    expect(result.provider).toBeNull();
    expect(ProviderAttempt.create).toHaveBeenCalledTimes(2);

    // Failed attempts must not deduct provider credits.
    expect(providers[0].save).not.toHaveBeenCalled();
    expect(providers[1].save).not.toHaveBeenCalled();
    expect(providers[0].balance).toBe(100);
    expect(providers[1].balance).toBe(100);
  });
});
