/********************************************
 *           Функционал для кармы           *
 * ******************************************/

const wsData = Sheet('Рейтинг');
const wsSetting = Sheet('Settings');

function setCarma(name, chatId, chatName) {
  let arrChatId = wsData.getRange(2, 5, wsData.getLastRow()).getValues().flat();
  let idRow = arrChatId.indexOf(+chatId) + 2;
  if (idRow == 1) {
    wsData.appendRow(['', name, 1, chatId, chatName]);
    let currentCarma = 1
    return currentCarma
  }
  let currentCarma = wsData.getRange(idRow, 3).getValue();
  currentCarma = currentCarma + 1
  wsData.getRange(idRow, 3).setValue(currentCarma);
  wsData.getRange('B2:E').sort({ column: 3, ascending: false });
  return currentCarma
}

function leaderBoard() {
  let dataTop = wsData.getRange(2, 1, wsData.getLastRow(), 3).getDisplayValues()
  let board = []
  for (let i = 0; i < dataTop.length - 1; i++) {
    board.push(`<code>${dataTop[i][0]}</code> <b>${dataTop[i][1]}: ${dataTop[i][2]}</b>\n`)
  }
  let text = '🏆 <b>Таблица лидеров</b>\n\n' + board.slice(0, 20).join('');
  //console.log(text)
  return text
}

function thanks(query) {
  let dataThanks = wsSetting.getRange(2, 1, wsSetting.getLastRow() - 1).getValues().flat();

  return dataThanks.filter(function (el) {
    return el.toLowerCase().indexOf(query.toLowerCase()) > -1;
  })
}

function matchesThanks(query) {
  // query = '+'
  query = query.toLowerCase().replace(/[\s.,№#"'%?!&()<>]/g, ' ').split(' ').filter(Boolean)
  let dataThanks = wsSetting.getRange(2, 1, wsSetting.getLastRow() - 1).getValues().flat();

  let matches = dataThanks.filter(function (item) {
    return query.indexOf(item.toLowerCase()) > -1
  })
  return matches
}

function getTrophy(chatId) {
  let arrChatId = wsData.getRange(2, 4, wsData.getLastRow()).getValues().flat();
  let idRow = arrChatId.indexOf(+chatId) + 2;
  let trophy = false
  if (idRow > 1 && idRow < 5) {
    trophy = wsData.getRange(idRow, 1).getValue();
  }
  return trophy
}

function getUserInfo(first_name = '', last_name = '', username = '') {
  let user = {
    first_name: first_name,
    last_name: last_name == '' ? '' : ' ' + last_name,
    username: username
  }
  return user
}

/********************************************
 *                Bot функции               *
 * ******************************************/

function Sheet(name) {//открытие листа текущей таблицы
  return SpreadsheetApp.openById(botSheet).getSheetByName(name);
}

//функция подписки
function join(chat_id, name, last_name, row_t){
  let row = undefined
  if(row_t){
    row = row_t
  }
  else{
    row = search_row(chat_id, 'users', 2)
  }
  if(row){
    return 0
  }
  let add_info = [chat_id, name, last_name, DATE_CURRENT]
  setSheetValues("users", add_info)
  sendText(chat_id, "✅Подписаны✅")
  return 0
}

//функция отписки
function leave(chat_id, row_t){
  let row = undefined
  if(row_t){
    row = row_t
  }
  else{
    row = search_row(chat_id, 'users', 2)
  }
  if(row){
    Sheet("users").deleteRow(row)
    Bot.sendMessage("❌Отписаны❌")
  }
  return 0
}


//функция получения количества подписчиков
function fan_num(_chat_id){
  return Sheet("users").getLastRow()-1
}

//переменная сообщения donate
let msgd = TelegramLibrary.donate_msg();

//функция отправки количества подписчиков админу или фанатам
function send_fans_number(chat_id){
  let keyboard = undefined
  if(Admins_UID.indexOf(chat_id) < 0){
    keyboard = keyboard_fans
  }
  else{
    keyboard = keyboard_admins
  }
  sendTextKeyboard(chat_id, "Количество подписчиков: "+String(fan_num(chat_id)), keyboard)
}

//получение значений с одного полного столбца с конкретного листа
function getDataColumnSheet(sheetName, row=1,col=1) {
  //sheetName = 'Test';
  try{
    const list = Sheet(sheetName).getSheetValues(row, col, Sheet(sheetName).getLastRow(), 1).filter(n => n!='').flat();
    //console.log(list);
    return list
  }
  catch{
    return null
  }
}

//Получение значений начиная со стартовго столбца и до конца строки
function getDataRowSheet(sheetName, row=1,col=1) {
  //sheetName = 'Test';
  try{
    const list = Sheet(sheetName).getSheetValues(row, col, 1, Sheet(sheetName).getLastColumn()).filter(n => n!='').flat();
    //console.log(list);
    return list
  }
  catch{
    return null
  }
}

function getDataUsers(sheetname) {
  sheetname = 'users';
  try{
    let ss = SpreadsheetApp.openById(botSheet);
    let sheet = ss.getSheetByName(sheetname);
    let data = sheet.getRange(2, 2, sheet.getLastRow()-1, 4).getValues();
    let lists = []
    for (i in data) {
      lists.push(`${data[i][0]}*~${data[i][2]}*~${data[i][3]}`);
    }
    list = lists.flat()
    console.log(list)
    return list
  }
  catch{
    return 0
  }
}

//чтение данных на листе
function getDataSheet(sheetName) {
  //sheetname = 'Instructions'
  return Sheet(sheetName).getRange().getValues();
}

//добавление массива в виде новой строки на листе
function addDataSheet(sheetName, data) {
  Sheet(sheetName).appendRow(data)
}

//взятие одного значения с ячейки на листе
function getSheetValue(sheetName, row, col){
  return Sheet(sheetName).getSheetValues(row, col, 1, 1)
}

//функция взятия значений в нужном листe
function getSheetVal(sheetName, row, col){
  return Sheet(sheetName).getSheetValues(row, col, 1, 1)[0][0]
}

//функция установки значений в нужный лист
function setSheetVal(sheetName, row, col, val){
  return Sheet(sheetName).getRange(row, col).setValue(val)
}

//функция добавления строки с контентом из массива по ячейкам через запятую
function setSheetValues(sheetName, val){
  let values = val.toString().split(',');
  return Sheet(sheetName).appendRow(values)
}

//функция удаления ячейки из листа
function deleteSheetVal(sheetName, row, col){
  return Sheet(sheetName).getRange(row, col).deleteCells();
}

function delSheet(sheetName) {
  //sheetName = 'лист';
  SpreadsheetApp.openById(botSheet).setActiveSheet(Sheet(sheetName), true);
  return SpreadsheetApp.openById(botSheet).deleteActiveSheet();
}

// функция деления массива (длина элементов, массив который нужно разделить, новый список после деления)
function listArray(num, array, container) {
  for (d = 0; d < array.length; d += num) {
    container.push(array.slice(d, d + num));
  }
  return container
}

function finalCountdown() {
  let token = tgBotToken;
  let chatID = TelegramJSON.message.chat.id;
  let urls = 'https://api.telegram.org/bot' + token +
      '/sendMessage?chat_id=' + chatID + '&text=It\'s the final countdown!';
  let response = UrlFetchApp.fetch(urls);
  response = JSON.parse(response.getContentText());
  let msgID = response.result.message_id;
  Utilities.sleep(1000);
  let baseUrl = 'https://api.telegram.org/bot' + token +
      '/editMessageText?chat_id=' + chatID + '&message_id=' + msgID + '&text=';
  let w = { '0': "0️⃣", '1': "1️⃣", '2': "2️⃣", '3': "3️⃣", '4': "4️⃣", '5': "5️⃣", '6': "6️⃣", '7': "7️⃣", '8': "8️⃣", '9': "9️⃣", ":": "▪️" }

  let url;
  for (let i = 0; i < 15; ++i) {

      let date = new Date();
      let timestamp = date.getTime();
      let timezone = Session.getScriptTimeZone()
      let times = Utilities.formatDate(date, timezone, "HH:mm:ss");
      url = baseUrl + [...times.toString()].map(e => w[e]).join();
      UrlFetchApp.fetch(url);
      Utilities.sleep(1000);
  }
  url = baseUrl + '💣Boom!';
  UrlFetchApp.fetch(url);
}

//функция поиска строки на листе по значению
function search_row(text, list, index, start_row = 1){
  //text = "Вторая"; 
  //list = 'test';
  let lastRow = Sheet(list).getLastRow();
  for(start_row=1; start_row<=lastRow; start_row++){
    this_text = getSheetVal(list, start_row, index)
    if(this_text == String(text)){
      //console.log(start_row)
      return start_row
    }
    else undefined
  }
}

//функция поиска колонки на листе по значению
function search_col(text, list, index, start_col = 1){
  //text = "Паспорт"; 
  //list = 'users';
  let lastColumn = Sheet(list).getLastColumn();
  for(start_col=1; start_col<=lastColumn; start_col++){
    this_text = getSheetVal(list, index, start_col)
    if(this_text == String(text)){
      //console.log(start_col)
      return start_col
    }
    else undefined
  }
}

//взятие массива значений
function getSheetValues(sheetName, row, col, cols=1){
  return Sheet(sheetName).getSheetValues(row, col, Sheet(sheetName).getLastRow(), cols)
}

function getInfoArticles(){
  let values = Sheet('Архив').getRange(1, 1, Sheet('Архив').getLastRow(), Sheet('Архив').getLastColumn()).getValues();
  let board = []
  for (let i = 0; i < Sheet('Архив').getLastRow(); i++) {
    let info = (`<a href="${values[i][1]}">${values[i][0]}</a>\n`)
    board += info;
  }
  return board.toString();
}

function getInfoValues(){ //телфоны доверия
  let values = Sheet('INFO').getRange(1, 1, Sheet('INFO').getLastRow(), Sheet('INFO').getLastColumn()-1).getValues();
  let board = []
  for (let i = 0; i < Sheet('INFO').getLastRow(); i++) {
    if(values[i][0] == 'Телефоны доверия' || values[i][0] == 'Все об Уфе'){
      let info = (`<a href="${values[i][1].substring(19)}">${values[i][0]}</a>\n`);
      board += info;
    }
    else{
      let info = (`<a href="${values[i][1]}">${values[i][0]}</a>\n`)
      board += info;
    }
  }
  return board.toString();
}