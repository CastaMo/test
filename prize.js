function getDefaultPrize(DefaultPrizeCount) {
  return Array(DefaultPrizeCount).fill(0).map((ignore, index) => {
    return {
      label: `奖品${index + 1}`
    }
  })
};

function checkPrizePoolMatchExpect(PrizePool, expectPrizeResult) {
  if (!expectPrizeResult || expectPrizeResult.length === 0) return true // 防止死循环
  return expectPrizeResult.every(expectItem => {
    const item = PrizePool.find(poolItem => poolItem.label === expectItem.label)
    if (!item) return false
    return expectItem.checkItem(item)
  })
}

function getItemByRandom(PrizePool, random) {
  if (PrizePool.length === 0) return null
  let left = 0 // 区间左数据
  let right = 0 // 区间右数据
  for (let i = 0, len = PrizePool.length; i < len; i++) {
    const item = PrizePool[i]
    right += item.value
    if (random >= left && random <= right) return item // 如果命中区间则返回
    left += item.value // 否则左区间加上概率权重，继续下一轮迭代
  }
  return null
}

function distributeRemainValue(PrizePool) {
  let currentValue = 0
  let hasValueCount = 0
  PrizePool.forEach(item => {
    if (typeof item.value === 'number') {
      currentValue += item.value
      hasValueCount++
    }
  })
  if (currentValue > 1) {
    console.log('填写概率有误，请重新填写！')
    return
  }
  const remainEveryValue = (1 - currentValue) / (PrizePool.length - hasValueCount)
  PrizePool.forEach(item => {
    if (typeof item.value !== 'number') {
      item.value = remainEveryValue
    }
  })
}

function main() {

  /**
   * label：奖品名称，value：概率权重，总和为1，value存在时则直接认定该概率，如果不存在，则计算存在的value，余下的概率均分给其他没有value
   * 比如下面AB填了0.2，那么他们拿到的概率就是0.2，余下CDE均分余下的1 - 0.2 * 2 = 0.6，也就是每个奖品也还是0.2的概率
   */
  const PrizePool = [
    {label: 'A', value: 0.2},
    {label: 'B', value: 0.2},
    {label: 'C'},
    {label: 'D'},
    {label: 'E'},
  ]

  // 提供一种快捷的初始化方法，获取等值概率数量的奖品数据，以奖品1、奖品2命名
  // const DefaultPrizeCount = 26
  // const PrizePool = getDefaultPrize(DefaultPrizeCount)


  PrizePool.forEach(item => item.count = 0)


  // 均分余下概率{
  distributeRemainValue(PrizePool)

  /**
   * 预期抽奖结果
   * 这里的label要和奖品名称对应起来，通过检查方法checkItem来确认是否符合预期
   * 下面实例是ABC都要抽到一个
   */
  const expectPrizeResult = [
    {label: 'A', checkItem: (item) => item.count >= 100},
    {label: 'B', checkItem: (item) => item.count >= 100},
    {label: 'C', checkItem: (item) => item.count >= 100},
  ]

  let count = 0
  while (true) {
    if (checkPrizePoolMatchExpect(PrizePool, expectPrizeResult)) {
      console.log(`满足所有条件，一共抽奖次数为${count}，此时抽到的奖品数量情况为：`)
      PrizePool.forEach(item => {
        console.log(`${item.label}: ${item.count}`)
      })
      break
    }
    const random = Math.random()
    const item = getItemByRandom(PrizePool, random)
    if (!item) {
      console.log('程序有误！提前退出')
      break
    }
    console.log(`第${++count}次抽奖，随机数为：${random}, 取出奖品为：${item.label}，累计数量为：${++item.count}`)
  }

}

main()