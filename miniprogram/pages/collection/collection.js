const seriesData = require('../../data/series.json')
const { getMyCollection } = require('../../utils/db')

Page({
  data: {
    summaryList: [],
    totalOwned: 0,
    totalSpent: 0,
    loading: true,
  },

  async onShow() {
    this.loadCollection()
  },

  async loadCollection() {
    this.setData({ loading: true })
    const records = await getMyCollection()

    let totalSpent = 0
    records.forEach(r => { if (r.purchasePrice) totalSpent += r.purchasePrice })

    const summaryMap = {}
    records.forEach(r => {
      if (!summaryMap[r.seriesId]) summaryMap[r.seriesId] = []
      summaryMap[r.seriesId].push(r.figureId)
    })

    const summaryList = seriesData
      .filter(s => summaryMap[s.id])
      .map(s => {
        const ownedIds = summaryMap[s.id] || []
        const ownedFigures = s.figures.filter(f => ownedIds.includes(f.id))
        return {
          id: s.id,
          name: s.name,
          brand: s.brand,
          totalCount: s.totalCount,
          ownedCount: ownedIds.length,
          pct: Math.round((ownedIds.length / s.totalCount) * 100),
          hasHidden: ownedFigures.some(f => f.type === 'hidden'),
        }
      })

    this.setData({
      summaryList,
      totalOwned: records.length,
      totalSpent: totalSpent.toFixed(0),
      loading: false,
    })
  },

  onSeriesTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/series/series?id=${id}` })
  },

  onGoDiscovery() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  onMakePoster() {
    wx.navigateTo({ url: '/pages/poster/poster' })
  },
})
