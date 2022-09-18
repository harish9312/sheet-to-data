import { extractSheets } from 'spreadsheet-to-json'
import mongoose from 'mongoose'
import { format } from 'date-fns'
import bodyParser from 'body-parser'
import express from 'express';

export const saveSheetData = async (rows) => {

    mongoose.connect('mongodb://localhost:27017/mydb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on('error', err => console.error(err))
    db.once('open', () => console.log("DB Connected"))


    const columns = Object.keys(rows[0])
    const getSchemaObject = {};
    console.log('>>columns', columns.length);
    columns.forEach(key => {
        getSchemaObject[key] = 'String'
    });
    let allRow = [];
    const sheetSchema = new mongoose.Schema(getSchemaObject)
    const SheetModel = mongoose.model(`${format(new Date(), 'MM-dd-yyyy')}`, sheetSchema)
    const allPromise = rows.map(async data => {
        return await SheetModel.create(data);
    })
    allRow = await Promise.all(allPromise)
    db.close()
    return allRow;
}

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/save-data', async (req, res) => {
    console.log('>>req', req.body);
    const allData = await saveSheetData(req.body)
    return res.json({
        allData,
        msg: "SUCCESS"
    })
})

var server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
});

A7JrboDDZSnGnjgwfmpmwRcnGcAMQqVFxPihzziHNuGe0YnhgSTWD6hvFj95ixrK

