const isGiveaway = (giveaway, from) => {
  let p = false
  Object.keys(giveaway).forEach((i) => {
    if (giveaway[i].from === from) {
      p = giveaway[i]
    }
  })
  return p
}

const isGiveaways = (giveaway, owner, reward) => {
  let p = false
  Object.keys(giveaway).forEach((i) => {
    if (giveaway[i].owner == owner && giveaway[i].reward == reward) {
      p = giveaway[i]
    }
  })
  return p
}

const addGiveaway = (giveaway, from) => {
  return new Promise((resolve, reject) => {
    if (isGiveaway(giveaway, from)) return reject('There is already a giveaway in the group')
    let obj = {from: from, giveaways: []}
    giveaway.push(obj)
    resolve(giveaway)
  })
}

const addGiveaways = (giveaway, from, owner, reward) => {
  return new Promise((resolve, reject) => {
    if (!isGiveaway(giveaway, from)) {
      addGiveaway(giveaway, from)
    }
    if (isGiveaways(isGiveaway(giveaway, from).giveaways, owner, reward)) return reject('That giveaway already exists')
    let obj = {owner: owner, premio: reward, participants}
    isGiveaways(isGiveaway(giveaway, from).giveaways.push(obj)
    resolve(obj)
  })
}

module.exports = { addGiveaway, addGiveaways, isGiveaway, isGiveaways }