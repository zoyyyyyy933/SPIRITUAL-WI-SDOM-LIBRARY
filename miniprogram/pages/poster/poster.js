const seriesData = require('../../data/series.json')
const { getMyCollection } = require('../../utils/db')

Page({
  data: {
    stats: null,
    generated: false,
    saving: false,
  },

  async onLoad() {
    const records = await getMyCollection()
    let totalSpent = 0
    records.forEach(r => { if (r.purchasePrice) totalSpent += r.purchasePrice })

    const seriesCount = new Set(records.map(r => r.seriesId)).size
    const hiddenCount = records.filter(r => {
      const s = seriesData.find(s => s.id === r.seriesId)
      const fig = s && s.figures.find(f => f.id === r.figureId)
      return fig && fig.type === 'hidden'
    }).length

    this.setData({
      stats: {
        total: records.length,
        seriesCount,
        hiddenCount,
        spent: totalSpent.toFixed(0),
      }
    })
  },

  onGenerate() {
    const ctx = wx.createCanvasContext('poster-canvas', this)
    const { stats } = this.data
    const W = 375, H = 500

    // 背景渐变
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1A1A2E')
    grad.addColorStop(1, '#0F3460')
    ctx.setFillStyle(grad)
    ctx.fillRect(0, 0, W, H)

    // 装饰圆
    ctx.beginPath()
    ctx.arc(W - 60, 80, 120, 0, Math.PI * 2)
    ctx.setFillStyle('rgba(123,94,167,0.15)')
    ctx.fill()

    ctx.beginPath()
    ctx.arc(60, H - 80, 100, 0, Math.PI * 2)
    ctx.setFillStyle('rgba(200,169,110,0.1)')
    ctx.fill()

    // Logo 文字
    ctx.setFontSize(28)
    ctx.setFillStyle('#C8A96E')
    ctx.setTextAlign('center')
    ctx.fillText('BoxVault', W / 2, 60)

    ctx.setFontSize(14)
    ctx.setFillStyle('rgba(240,234,214,0.5)')
    ctx.fillText('盲盒收藏管理', W / 2, 84)

    // 分割线
    ctx.beginPath()
    ctx.moveTo(40, 100)
    ctx.lineTo(W - 40, 100)
    ctx.setStrokeStyle('rgba(255,255,255,0.1)')
    ctx.setLineWidth(1)
    ctx.stroke()

    // 大数字 - 总数
    ctx.setFontSize(90)
    ctx.setFillStyle('#C8A96E')
    ctx.setTextAlign('center')
    ctx.fillText(stats.total, W / 2, 230)

    ctx.setFontSize(20)
    ctx.setFillStyle('rgba(240,234,214,0.6)')
    ctx.fillText('件盲盒已入库', W / 2, 260)

    // 三列小统计
    const col = W / 3
    const metrics = [
      { label: '参与系列', value: stats.seriesCount },
      { label: '已收隐藏款', value: stats.hiddenCount },
      { label: '累计花费(¥)', value: stats.spent },
    ]
    metrics.forEach((m, i) => {
      const x = col * i + col / 2
      ctx.setFontSize(36)
      ctx.setFillStyle('#F0EAD6')
      ctx.setTextAlign('center')
      ctx.fillText(String(m.value), x, 330)
      ctx.setFontSize(18)
      ctx.setFillStyle('rgba(240,234,214,0.5)')
      ctx.fillText(m.label, x, 356)
    })

    // 底部
    ctx.setFontSize(18)
    ctx.setFillStyle('rgba(200,169,110,0.7)')
    ctx.setTextAlign('center')
    ctx.fillText('扫码一起管理我的盲盒收藏 ↑', W / 2, H - 40)

    ctx.draw(false, () => {
      this.setData({ generated: true })
    })
  },

  onSave() {
    if (this.data.saving) return
    this.setData({ saving: true })
    wx.canvasToTempFilePath({
      canvasId: 'poster-canvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册 ✓', icon: 'none' })
          },
          fail: () => {
            wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' })
          },
          complete: () => { this.setData({ saving: false }) }
        })
      },
      fail: () => { this.setData({ saving: false }) }
    }, this)
  },
})
