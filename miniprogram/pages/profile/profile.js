const { getMyCollection } = require('../../utils/db')
const seriesData = require('../../data/series.json')

Page({
  data: {
    userInfo: null,
    hasLogin: false,
    stats: { total: 0, seriesCount: 0, hiddenCount: 0, spent: '0', rarest: null },
  },

  async onShow() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo, hasLogin: true })
      this.loadStats()
    }
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于展示收藏者信息',
      success: (res) => {
        const app = getApp()
        app.globalData.userInfo = res.userInfo
        this.setData({ userInfo: res.userInfo, hasLogin: true })
        this.loadStats()
      }
    })
  },

  async loadStats() {
    const records = await getMyCollection()
    let totalSpent = 0
    records.forEach(r => { if (r.purchasePrice) totalSpent += r.purchasePrice })

    const seriesCount = new Set(records.map(r => r.seriesId)).size

    let hiddenCount = 0
    let rarest = null
    records.forEach(r => {
      const s = seriesData.find(s => s.id === r.seriesId)
      const fig = s && s.figures.find(f => f.id === r.figureId)
      if (fig && fig.type === 'hidden') {
        hiddenCount++
        if (!rarest) rarest = { name: fig.name, series: s.name }
      }
    })

    this.setData({
      stats: {
        total: records.length,
        seriesCount,
        hiddenCount,
        spent: totalSpent.toFixed(0),
        rarest,
      }
    })
  },
})
