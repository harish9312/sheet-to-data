import { extractSheets } from 'spreadsheet-to-json'
import mongoose from 'mongoose'
import { format } from 'date-fns'

export const saveSheetData = async (event, context, callback) => {

  mongoose.connect('mongodb://localhost:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', err => console.error(err))
  db.once('open', () => console.log("DB Connected"))

  // const configSchema = mongoose.Schema({
  //   schemaName: String,
  //   columnsLength: Number,
  //   columns: Array
  // })
  // const ConfigModel = mongoose.model(`Config`, configSchema)

  return await extractSheets({
    spreadsheetKey: '1MovP1fZZgF94HkVUMgltSt7GRxBvV8_nPOhsO3PEYGA',
    credentials: 'AIzaSyDnwmctuRxipGNwd-hfaYy3j0W4lNsm0jA',
  }).then(async res => {
    console.log('>>res', res);
    const sheetName = Object.keys(res)[0];
    const columns = Object.keys(res[sheetName][0])
    const getSchemaObject = {};
    console.log('>>columns', columns.length);
    columns.forEach(key => {
      getSchemaObject[key] = 'String'
    });

    // const config = await ConfigModel.findOne({ columnsLength: columns.length }).exec()
    let allRow = [];
    console.log('>>config', config);
    // if (!config) {
    // ConfigModel.create({
    //   schemaName: `${format(new Date(), 'MM-dd-yyyy')}`,
    //   columnsLength: columns.length,
    //   columns
    // })
    const sheetSchema = new mongoose.Schema(getSchemaObject)
    const SheetModel = mongoose.model(`${format(new Date(), 'MM-dd-yyyy')}`, sheetSchema)
    const allPromise = res[sheetName].map(async data => {
      return await SheetModel.create(data);
    })
    allRow = await Promise.all(allPromise)
    return allRow;
    // }

    // const SheetModel = db.collection(config.schemaName)
    // const allPromise = res[sheetName].map(async data => {
    //   console.log('>>data', data);
    //   return await SheetModel.updateOne({ _id: data._id }, { $set: data }, {
    //     upsert: true
    //   });
    // })
    // allRow = await Promise.all(allPromise)
    console.log('>>allRow', allRow);
    db.close()
    return allRow;
  }).catch(err => {
    console.log('>>err', err);
  })
}

saveSheetData(null, null, null).then(allRow => {
  console.log('>>allRow', allRow);
}).catch(err => {
  console.log('>>err', err);
})