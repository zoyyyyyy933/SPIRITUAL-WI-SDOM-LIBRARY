const db = wx.cloud.database()
const _ = db.command

const COL = {
  userCollection: db.collection('user_collection'),
  series: db.collection('series'),
}

async function getMyCollection() {
  const res = await COL.userCollection.where({ _openid: '{openid}' }).get()
  return res.data
}

async function addFigure(figureId, seriesId, price, photoUrl) {
  const existing = await COL.userCollection
    .where({ figureId, _openid: '{openid}' })
    .count()
  if (existing.total > 0) {
    return { alreadyExists: true }
  }
  return COL.userCollection.add({
    data: {
      figureId,
      seriesId,
      purchasePrice: price || null,
      purchaseDate: db.serverDate(),
      photoUrl: photoUrl || null,
    },
  })
}

async function removeFigure(figureId) {
  const res = await COL.userCollection
    .where({ figureId, _openid: '{openid}' })
    .get()
  if (res.data.length === 0) return
  return COL.userCollection.doc(res.data[0]._id).remove()
}

async function getCollectionBySeriesId(seriesId) {
  const res = await COL.userCollection
    .where({ seriesId, _openid: '{openid}' })
    .get()
  return res.data.map(r => r.figureId)
}

module.exports = { getMyCollection, addFigure, removeFigure, getCollectionBySeriesId }
