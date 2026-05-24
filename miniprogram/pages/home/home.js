const seriesData = require('../../data/series.json')

Page({
  data: {
    seriesList: [],
    filteredList: [],
    searchKeyword: '',
    brandFilter: 'all',
    brands: ['all', '泡泡玛特', '52TOYS'],
  },

  onLoad() {
    this.setData({ seriesList: seriesData, filteredList: seriesData })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.applyFilter()
  },

  onBrandFilter(e) {
    const brand = e.currentTarget.dataset.brand
    this.setData({ brandFilter: brand })
    this.applyFilter()
  },

  applyFilter() {
    const { seriesList, searchKeyword, brandFilter } = this.data
    let list = seriesList
    if (brandFilter !== 'all') {
      list = list.filter(s => s.brand === brandFilter)
    }
    if (searchKeyword) {
      list = list.filter(s =>
        s.name.includes(searchKeyword) || s.brand.includes(searchKeyword)
      )
    }
    this.setData({ filteredList: list })
  },

  onSeriesTap(e) {
    const seriesId = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/series/series?id=${seriesId}` })
  },
})
