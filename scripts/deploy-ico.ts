import { run, ethers } from 'hardhat'

const DEFAULT_DESCRIPTION = 'Ethereum DApp Tutorial'
const DEFAULT_MIN_INVEST = 100
const DEFAULT_MAX_INVEST = 10000
const DEFAULT_GOAL = 1000000

async function main() {
  await run('compile')
  const Ico = await ethers.getContractFactory('Ico')
  const ico = await Ico.deploy(DEFAULT_DESCRIPTION, DEFAULT_MIN_INVEST, DEFAULT_MAX_INVEST, DEFAULT_GOAL)
  await ico.deployed()
  console.log(ico.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })