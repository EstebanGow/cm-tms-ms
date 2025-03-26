const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
}

module.exports = {
    createClient: jest.fn().mockReturnValue(mockClient),
}
