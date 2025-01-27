const menu = [
 [[{'text': '📨 Отправить документы', 'callback_data': 'Отправить документы'}],
  [{'text': '🙋‍♂️Я собрал все документы🙋‍♀️', 'callback_data': 'sendWait'}],
  [{'text': '🔄 Посмотреть состояние', 'callback_data': 'loading'}],
  [{'text': '💬 Cообщение администратору', 'callback_data': 'sendmsgAdmin'}],
  [{'text': '🗒 Расписание работы', 'callback_data': 'schedule'}],
  [{'text': '⁉️ Как пользоваться?', 'url': 'https://telegra.ph/Kak-polzovatsya-botom-otdela-Opeki-07-18'}],
  [{'text': 'ℹ️ Информация об организации', 'callback_data': 'MoreInfo'}],
  [{'text': '☎️ Телефоны доверия', 'callback_data': 'Hotlines'}]],

  [[{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

  [[{'text': '👀 Посмотреть документы 📖', 'callback_data': 'Посмотреть документы'}],
   [{'text': '💬 Cообщение пользователям', 'callback_data': 'sendmsg'}],
   [{'text': '⚙️ Основные функции', 'callback_data': 'Functions'}],
   [{'text': '🗒 Расписание работы', 'callback_data': 'schedule'}],
   [{'text': '⁉️ Как пользоваться?', 'url': 'https://telegra.ph/Kak-polzovatsya-botom-otdela-Opeki-07-18'}],
   [{'text': 'ℹ️ Информация', 'callback_data': 'Information'}],
   [{'text': '☎️ Телефоны доверия', 'callback_data': 'Hotlines'}]],

  [[{'text': '📋 Инструкции', 'callback_data': 'Instructions'}],
   [{'text': '🗂️ Архив статей', 'callback_data': 'Articles'}],
   [{'text': '🪧 Информация об организации', 'callback_data': 'MoreInfo'}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

  [[{'text': '📄 Правила чата', 'callback_data': 'riding_rules'}]],

  [[{'text': '☑️ Принять', 'callback_data': 'agree with rules'}]],

  [[{ "text": "✅ С правилами ознакомлен", 'callback_data': 'pass' }]],

  [[{'text': '🏡 Назад', 'callback_data': 'Instructions'}]],

  [[{'text': '⚙️ Изменить документы 📖', 'callback_data': 'editDocs'}],
   [{'text': '➕ Добавить материал 📝', 'callback_data': 'Добавить материал'}],
   [{'text': '🗑️ Удалить материал 📝', 'callback_data': 'Удалить материал'}],
   [{'text': '➕ Добавить расписание 🗒', 'callback_data': 'Добавить расписание'}],
   [{'text': '🗑️ Удалить расписание 🗒', 'callback_data': 'Удалить расписание'}],
   [{'text': '➕ Добавить категорию ✳️', 'callback_data': 'Добавить категорию'}],
   [{'text': '🗑️ Удалить категорию ✳️', 'callback_data': 'Удалить категорию'}],
   [{'text': '➕ Добавить документ📄', 'callback_data': 'Добавить документ'}],
   [{'text': '🗑️ Удалить документ📄', 'callback_data': 'Удалить документ'}],
   [{'text': '❇️ Открыть таблицу ❇️', 'url': 'https://docs.google.com/spreadsheets/d/'+botSheet}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],
   
  [[{'text': '📨 Отправить документы', 'callback_data': 'Отправить документы'}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

  [[{'text': '☑️ Продолжить', 'callback_data': 'waiting'}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

  [[{'text': '✅ Продолжить', 'callback_data': 'waiting'}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

  [[{'text': '💬 Cообщение всем пользователям', 'callback_data': 'sendAllmsg'}],
   [{'text': '💬 Cообщение отдельной категории', 'callback_data': 'sendAllmsgTo'}],
   [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]],

];

//массив кнопок в зависимости от наличия значений таблицы
function getkeyFlags(chatid, return_key = "menu_start"){
  //chatid=252898281;
  let ind = search_row(chatid, 'users', 2); //индекс пользователя в базе данных
      
  let category = getSheetVal('users', ind, 10);//категория пользователя - название
  let indCategory = search_row(category, 'Test', 1);
  let a = Sheet('users').getRange(1, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//названия категорий
  let b = Sheet('Test').getRange(indCategory, 2, 1, Sheet('Test').getLastColumn()-1).getValues().flat(); //список обязательных документов
  let c = Sheet('users').getRange(ind, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//массив с данными пользователя

  const categories = b //новый список обязательных документов
    .filter(document => document.includes('✅'))
    .map(document => document.slice(2));
  
  let arrUCatNames = []; //список имеющихся документов у пользователя
  for (let i = 0; i < c.length; i++) {
    if (c[i]){ //если документ
      arrUCatNames.push(a[i]); //формирование списка названий по наличию документа 
    }
  }

  //функция проверки массивов на уникальность
  function unique(arr, arr2) {
    let result = [];

    for (let str of arr) {
      if (arr2.includes(str)) {
        result.push([{ text: '✅ '+str, callback_data: str}]);
      }
      else{
        result.push([{ text: '➖ '+str, callback_data: str}])
      }
    }
    result.push([{ text: '🏡 Назад', callback_data: return_key}])
  
    return result;
  }
  
  let keyboards = {
    inline_keyboard: [...unique(categories, arrUCatNames)]
  }
  //console.log(keys);
  return keyboards
}


//массив кнопок из значений таблицы с колбеком номера из списка
function getkeys(arraykeys, k, return_key = "menu_start", access_key){
  //arraykeys = Sheet('Test').getRange(3, 2, 1, Sheet('Test').getLastColumn()-1).getValues().flat(); //список обязательных документов
  let keys = [];

  if (k == 1){//режим 1
    for (i in arraykeys) {
      keys.push([{ text: String(arraykeys[i]), callback_data: i}]);
    }
    keys.push([{ text: '💬 Cообщить пользователям', callback_data: access_key}])
    keys.push([{ text: '🏡 Назад', callback_data: return_key }])//кнопка "назад" по-умолчанию
  }
  if (k == 2){ //режим 2
    for (i in arraykeys) {
      keys.push([{ text: String(arraykeys[i]), callback_data: String(arraykeys[i])}]);
    }
    keys.push([{ text: '🏡 Назад', callback_data: return_key }])//кнопка "назад" по-умолчанию
  }

  let keyboards = {
    inline_keyboard: [...keys]
  }
  //console.log(keys);
  return keyboards
}

//функция создания массива кнопок при просмотре списка материалов
function keySheets(arraykeys, page = "page-0", return_key = "menu_start", r=1) {

  let container = [];
  let keyboardLength = 5
  let pageArr = listArray(keyboardLength, arraykeys, container)

  page = +page.replace(/[^0-9]/g, '');

  let keys = [];
  
  if (r === 1) { //режим 1
    for (i in pageArr[page]) {
      let id = pageArr[page][i]; //id пользователя из списка
      if (id.includes('*~')) {//если кнопки = массив пользователей
        keys.push([{ text: `${id.split('*~')[1]} ${id.split('*~')[2]}`, callback_data: id.split('*~')[0]}]);
      }
      else {
        keys.push([{ text: id, callback_data: id}]);
      }
    }
  }

  if (r === 2) { //режим 2
    for (i in pageArr[page]) {
      keys.push([{ text: String(arraykeys[i]), callback_data: String(arraykeys[i])}]);
    }
  }

  if (arraykeys.length > keyboardLength) {
    if (page == 0) {
      keys.push([{ text: '⏹', callback_data: "stop" }, { text: '🏡 Назад', callback_data: return_key }, { text: '▶️ ' + (page + 2) + " 📄", callback_data: "page-" + (page + 1) }])
    }
    else if (page == pageArr.length - 1) {
      keys.push([{ text: "📄 " + (page) + ' ◀️', callback_data: "page-" + (page - 1) }, { text: '🏡 Назад', callback_data: return_key }, { text: '⏹', callback_data: "stop" }])
    }
    else {
      keys.push([{ text: "📄 " + (page) + ' ◀️', callback_data: "page-" + (page - 1) }, { text: '🏡 Назад', callback_data: return_key }, { text: '▶️ ' + (page + 2) + " 📄", callback_data: "page-" + (page + 1) }])
    }
  }
  else{//если список кнопок меньше заданного значения 'keyboardlength'
    keys.push([{ text: '🏡 Назад', callback_data: return_key }])
  }

  let keyboards = {
    inline_keyboard: [...keys]
  }
  //console.log(JSON.stringify(keyboards))
  let obj = { nameOfSheets: arraykeys, keyboard: keyboards }
  return obj
}