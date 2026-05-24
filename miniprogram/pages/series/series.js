const seriesData = require('../../data/series.json')
const { addFigure, removeFigure, getCollectionBySeriesId } = require('../../utils/db')

Page({
  data: {
    series: null,
    figures: [],
    ownedIds: [],
    showPriceDialog: false,
    pendingFigureId: '',
    priceInput: '',
  },

  async onLoad(options) {
    const series = seriesData.find(s => s.id === options.id)
    if (!series) return
    const ownedIds = await getCollectionBySeriesId(series.id)
    const figures = series.figures.map(f => ({
      ...f,
      owned: ownedIds.includes(f.id),
    }))
    this.setData({ series, figures, ownedIds })
  },

  onFigureTap(e) {
    const { id, owned } = e.currentTarget.dataset
    if (owned) {
      this.confirmRemove(id)
    } else {
      this.setData({ showPriceDialog: true, pendingFigureId: id, priceInput: '' })
    }
  },

  async confirmRemove(figureId) {
    wx.showModal({
      title: '移出收藏',
      content: '确定要移出这款吗？',
      confirmText: '移出',
      confirmColor: '#E05C5C',
      success: async (res) => {
        if (!res.confirm) return
        await removeFigure(figureId)
        this.refreshOwned()
      }
    })
  },

  onPriceInput(e) {
    this.setData({ priceInput: e.detail.value })
  },

  async onPriceConfirm() {
    const { pendingFigureId, priceInput, series } = this.data
    const price = priceInput ? parseFloat(priceInput) : null
    wx.showLoading({ title: '入库中...' })
    await addFigure(pendingFigureId, series.id, price, null)
    wx.hideLoading()
    this.setData({ showPriceDialog: false })
    this.refreshOwned()
    wx.showToast({ title: '入库成功 ✓', icon: 'none' })
  },

  onPriceCancel() {
    this.setData({ showPriceDialog: false, pendingFigureId: '', priceInput: '' })
  },

  async refreshOwned() {
    const { series } = this.data
    const ownedIds = await getCollectionBySeriesId(series.id)
    const figures = this.data.series.figures.map(f => ({
      ...f,
      owned: ownedIds.includes(f.id),
    }))
    this.setData({ figures, ownedIds })
  },

  get completionPct() {
    const { figures } = this.data
    if (!figures.length) return 0
    const owned = figures.filter(f => f.owned).length
    return Math.round((owned / figures.length) * 100)
  },

  onGoCollection() {
    wx.switchTab({ url: '/pages/collection/collection' })
  },
})
