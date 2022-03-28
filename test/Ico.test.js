const { assert } = require("chai");
const { ethers } = require("hardhat");

const DEFAULT_DESCRIPTION = 'Ethereum DApp Tutorial'
const DEFAULT_MIN_INVEST = 100
const DEFAULT_MAX_INVEST = 10000
const DEFAULT_GOAL = 1000000
const BOUNDARY_TEST_ERROR_MESSAGE = 'Transaction reverted without a reason string'

describe("Ico", () => {
    let Ico
    let ico
    let accounts
    beforeEach(async () => {
        Ico = await ethers.getContractFactory('Ico')
        ico = await Ico.deploy(DEFAULT_DESCRIPTION, DEFAULT_MIN_INVEST, DEFAULT_MAX_INVEST, DEFAULT_GOAL)
        accounts = await ethers.getSigners()
    })

    it("should save correct project properties", async () => {
        const owner = await ico.owner()
        const description = await ico.description()
        const minInvest = await ico.minInvest()
        const maxInvest = await ico.maxInvest()
        const goal = await ico.goal()

        assert.equal(owner, accounts[0].address)
        assert.equal(description, DEFAULT_DESCRIPTION)
        assert.equal(minInvest, DEFAULT_MIN_INVEST)
        assert.equal(maxInvest, DEFAULT_MAX_INVEST)
        assert.equal(goal, DEFAULT_GOAL)
    })

    it('should allow investor to contribute', async () => {
        const investor = accounts[1]
        await ico.connect(investor).contribute({ value: '200' })
        const amount = await ico.investors(0)
        assert.equal(amount, investor.address)
    })

    it('should require minInvest', async () => {
        const investor = accounts[1]
        await ico.connect(investor).contribute({
            value: `${DEFAULT_MIN_INVEST}`
        })
        try {
            await ico.connect(investor).contribute({
                value: `${DEFAULT_MIN_INVEST - 1}`
            })
            assert.isOk(false)
        } catch (err) {
            assert.equal(err.message, BOUNDARY_TEST_ERROR_MESSAGE)
        }
    })

    it('should require maxInvest', async () => {
        const investor = accounts[1]
        await ico.connect(investor).contribute({
            value: `${DEFAULT_MAX_INVEST}`
        })
        try {
            await ico.connect(investor).contribute({
                value: `${DEFAULT_MAX_INVEST + 1}`
            })
            assert.isOk(false)
        } catch (err) {
            assert.equal(err.message, BOUNDARY_TEST_ERROR_MESSAGE)
        }
    })

    it('allows investor to approve payments', async () => {
        const owner = accounts[0]
        const investor = accounts[1]
        const receiver = accounts[2]
        const ownerContract = ico.connect(owner)
        const investorContract = ico.connect(investor)

        const oldBalance = await receiver.getBalance()
        await investorContract.contribute({ value: '5000' })
        await ownerContract.createPayment('Rent Office', 2000, receiver.address)
        await investorContract.approvePayment(0)
        await ownerContract.doPayment(0)

        const payment = await ico.payments(0)
        const newBalance = await receiver.getBalance()
        const balanceDiff = newBalance.sub(oldBalance)
        assert.isOk(payment.completed)
        assert.equal((await ownerContract.getPaymentVoteByIndex(0)).length, 1)
        assert.equal(balanceDiff, 2000)
    })
})