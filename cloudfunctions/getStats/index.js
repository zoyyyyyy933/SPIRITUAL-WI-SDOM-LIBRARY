const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const res = await db.collection('user_collection')
    .where({ _openid: openid })
    .get()

  const records = res.data
  let totalSpent = 0
  records.forEach(r => { if (r.purchasePrice) totalSpent += r.purchasePrice })

  return {
    total: records.length,
    seriesCount: new Set(records.map(r => r.seriesId)).size,
    totalSpent,
  }
}
