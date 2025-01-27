function msgText(TelegramJSON) {
  let text = TelegramJSON.message.text;
  let chatid = TelegramJSON.message.chat.id;
  let userProperties = PropertiesService.getUserProperties();
  let userData = JSON.parse(userProperties.getProperty(chatid));
  Bot.sendChatAction();
  let msg, msg2 = '';

  if (text === '⭐️' || text === '⭐️⭐️' || text === '⭐️⭐️⭐️' || text === '⭐️⭐️⭐️⭐️' || text === '⭐️⭐️⭐️⭐️⭐️') {
    setSheetVal('users', search_row(chatid, 'users', 2), 8, text)//вставка рейтинга напротив id пользователя
    Bot.sendMessageKeyboardRemove('Спасибо Вам за Ваш рейтинг!☺️');
    return;
  }

  if (text && userData.callback_query_data.includes('setStatus')){
    Bot.sendChatAction();
    if (getDataColumnSheet('Settings', row=2,col=4).includes(text)) {
      let ind = search_row(userData.callback_query_data.split('_')[1], 'users', 2);
      msg = '✅<b>Cтатус успешно изменён.</b> \n\n<i>Используйте: /start, чтобы снова перейти в главное меню</i>';
      Bot.deleteMessage(TelegramJSON.message.message_id);
      Bot.deleteMessage(TelegramJSON.message.message_id-1);//удаление 2-х предыдущих сообщений, для очистки мусора
      Bot.sendMessage(msg, {reply_markup: { remove_keyboard: true }});
      setSheetVal('users', ind, 9, text);
      msg2 = `✉️<b>Статус Вашей заявки обновлён:</b> \n<i>Текущий статус:</i> <b>${text}\n\nС уважением, отдел опеки г.Уфа</b>`;
      Bot.sendMessageTo(userData.callback_query_data.split('_')[1], msg2);
      return;
    }
    else {
      msg = '⚠️ Выберите статус из списка снизу';
      Bot.sendMessage(msg);
      return;
    }
  }

  if (text && userData.callback_query_data === 'Добавить расписание') {
    let msg = '✅<b>Расписание успешно добавлено.</b> \n\n<i>Используйте: /start, чтобы снова перейти в главное меню</i>';
    setSheetVal('Settings', 2, 2, text)
    userProperties.deleteProperty(chatid);
    Bot.deleteMessage(TelegramJSON.message.message_id);
    Bot.deleteMessage(TelegramJSON.message.message_id-1);//удаление 2-х предыдущих сообщений, для очистки мусора
    Bot.sendMessage(msg);
    return;
  }

  if (text && userData.callback_query_data === 'Добавить материал') {
    if ( text.split('///')[0].length > 30 ) {
      let msg = `⚠️<b>Название материала не должно превышать 30 символов.</b> \n\n<i>Перед основным текстом ограничьте название тремя чертами:\n<b>Например:</b>Название///Текст...</i>`;
      Bot.sendMessage(msg);
    }
    if (text.split('///')[1].length > 1024) {
      let msg = `⚠️<b>Описание материала не должно превышать 1024 символа.</b> \n\n<i>Если у Вас большой материал: используйте @telegraph для сохрания материала в виде статьи, в сообщении боту пришлите ссылку на материал. Так материал не будет сразу отпугивать по объёму и будет наиболее читаемый в мобильных устройствах</i>`;
      Bot.sendMessage(msg);
    }
    else {//если название от 1 до 30 и описание до 1024
      Sheet("Instructions").appendRow([text.split('///')[0], text.split('///')[1], '', 'Текст']);
      let msg = `✅Текст успешно добавлен. \n\n<i>Продолжайте присылать материалы для добавления,\n/start, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
    }
    return;
  }

  if (text && userData.callback_query_data === 'Добавить категорию') {
    if ( text.length > 30 ) {
      let msg = `⚠️<b>Название не должно превышать 30 символов.</b>\n\n<i>Если название будет больше 30 символов, текст выйдет за границы экрана в одной строке, что делает его менее читабельным</i>`;
      Bot.sendMessage(msg);
    }
    else {//если название от 1 до 30
      let data = [text];
      let data1 = Sheet('Users').getRange(1, 11, 1, Sheet('Users').getLastColumn()-10).getValues().flat();
      for(let i = 0; i < data1.length; i++) {
        data.push('➖ '+data1[i]);
      }
      Sheet("Test").appendRow(data);//добавление кнопок по умолчанию
      //userProperties.deleteProperty(chatid);
      Bot.deleteMessage(TelegramJSON.message.message_id);
      Bot.deleteMessage(TelegramJSON.message.message_id-1);//удаление 2-х предыдущих сообщений, для очистки мусора
      let msg = `✅Категория успешно добавлена. \n\n<i>Продолжайте присылать названия для добавления новых категорий,\n/start, чтобы снова перейти в главное меню</i>`;
      Bot.sendMessage(msg);
    }
    return;
  }

  if (text && userData.callback_query_data === 'Добавить документ') {
    if ( text.length > 30 ) {
      let msg = `⚠️<b>Название не должно превышать 30 символов.</b>\n\n<i>Если название будет больше 30 символов, текст выйдет за границы экрана в одной строке, что делает его менее читабельным</i>`;
      Bot.sendMessage(msg);
    }
    else {//если название от 1 до 30
      setSheetVal('users', 1, Sheet('users').getLastColumn()+1, text);
      const lastColumn = Sheet('Test').getLastColumn()+1;
      const lastRow = Sheet('Test').getLastRow();
      for(let i = 1; i <= lastRow; i++) {
        setSheetVal('Test', i, lastColumn, `➖ `+text);
      }
      let msg = `✅Документ успешно добавлен. \n\n<i>Продолжайте присылать названия для добавления новых категорий,\n/start, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.deleteMessage(TelegramJSON.message.message_id);
      Bot.deleteMessage(TelegramJSON.message.message_id-1);//удаление 2-х предыдущих сообщений, для очистки мусора
      Bot.sendMessage(msg);
    }
    return;
  }

  if (text && userData.callback_query_data.includes('sendmsgAdmin') ) { // отправка сообщения администратору от пользователя
    msg2 = "<b>Босс, новое сообщение от: " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUserFullName() + "</a></b>\n\n✉️" + text;
    let key = [[{'text': '✉️ Ответить', 'callback_data': `sendmsg_${chatid}`}]];
    Bot.sendMessageTo(superAdmin[0], msg2, {'reply_markup': {'inline_keyboard': key}});
    Bot.deleteMessage(TelegramJSON.message.message_id-1);
    msg = `✅<b>Ваше сообщение успешно отправлено. </b> \n\n<i>/start, чтобы снова перейти в главное меню</i>`;
    userProperties.deleteProperty(chatid);
    Bot.sendMessage(msg);
    return;
  }

  if (text && userData.callback_query_data === 'sendAllmsg' ) { // отправка сообщения всем пользоватеям
    let users = getDataColumnSheet('users', 2, 2);//пользователи
    msg = text +'\n<b>С уважением, отдел опеки г.Уфа</b>';
    for (i in users) {
      Bot.sendMessageTo(users[i], msg);
    }
    msg = `Проинформировано: <b>${+i+1}</b> из <b>${users.length}</b>\n\n<i>/start, чтобы снова перейти в главное меню</i>`;
    Bot.sendMessage(msg);
    //userProperties.deleteProperty(chatid);
    return;
  }

  if (text && userData.callback_query_data.includes('sendAllmsgTo') ) { // отправка сообщения категории пользователей
    let users = Sheet('users').getRange(2, 2, Sheet('users').getLastRow(), 9).getValues();
    msg = text +'\n\n<b>С уважением, отдел опеки г.Уфа</b>';
    let c = 0;
    for (i in users) {
      if (users[i][8] === userData.callback_query_data.split('_')[1]){
        Bot.sendMessageTo(users[i][0], msg); c+=1;
      }
    }
    msg = `Проинформировано: <b>${c}</b> из <b>${users.length}</b>\n\n<i>/start, чтобы снова перейти в главное меню</i>`;
    Bot.sendMessage(msg);
    //userProperties.deleteProperty(chatid);
    return;
  }

  if (text && userData.callback_query_data.includes('sendmsg') ) { // отправка сообщения пользователю
    try{
      msg2 = text +'\n\n<b>С уважением, отдел опеки г.Уфа</b>';
      Bot.sendMessageTo(userData.callback_query_data.split('_')[1], msg2);
      msg = `✅<b>Сообщение успешно отправлено. </b> \n\n<i>/start, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
    }
    catch{
      msg = `⚠️Произошла ошибка`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
    }
    return;
  } 
}