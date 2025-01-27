//отправка фото
function msgPhoto(TelegramJSON) {
  let chatid = TelegramJSON.message.chat.id;
  let userProperties = PropertiesService.getUserProperties();
  let userData = JSON.parse(userProperties.getProperty(chatid));
  let photo = TelegramJSON.message.photo;
  Bot.sendChatAction();
  if (photo && userData.callback_query_data === 'Добавить материал') {
    if ( TelegramJSON.message.caption.split('///')[0].length > 30 ) {
      let msg = `⚠️<b>Название материала не должно превышать 30 символов.</b> \n\n<i>Перед основным текстом ограничьте название тремя чертами:\n<b>Например:</b>Название///Текст...</i>`;
      Bot.sendMessage(msg);
      return;
    }
    if (TelegramJSON.message.caption.split('///')[1].length > 1024) {
      let msg = `⚠️<b>Описание материала не должно превышать 1024 символа.</b> \n\n<i>Если у Вас большой материал: используйте @telegraph для сохрания материала в виде статьи, в сообщении боту пришлите ссылку на материал. Так материал не будет сразу отпугивать по объёму и будет наиболее читаемый в мобильных устройствах</i>`;
      Bot.sendMessage(msg);
      return;
    }
    else {//если название от 1 до 30 и описание до 1024 
      let sheet = SpreadsheetApp.openById(botSheet).getSheetByName("Instructions");
      sheet.appendRow([TelegramJSON.message.caption.split('///')[0], TelegramJSON.message.caption.split('///')[1], photo[3].file_id, 'Изображение']);
      let msg = `✅Изображение с описанием успешно добавлено. \n\n<i>Продолжайте присылать материалы для добавления,\n/start, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
      return;
    }
  }
  if (photo && userData.callback_query_data.includes('sendoc') ) {
    let ur = search_row(chatid, 'users', 2);
    let dcol = search_col(userData.callback_query_data.split('_')[1], 'users', 1);
    setSheetVal('users', ur, dcol, photo[3].file_id);
    msg = `✅Документ: <b>${userData.callback_query_data.split('_')[1]}</b> успешно добавлен.`;
    Bot.deleteMessage(TelegramJSON.message.message_id-1);
    Bot.deleteMessage(TelegramJSON.message.message_id);//удаление 2-х предыдущих сообщений, для очистки мусора
    //userProperties.deleteProperty(chatid);
    Bot.sendMessage(msg);
    let msg2 = '<b>Выберите документ из приведённого ниже списка👇</b>';
    userProperties.setProperty(chatid, JSON.stringify({callback_query_data: 'Отправить документы'}));
    Bot.sendMessage(msg2, {'reply_markup': getkeyFlags(chatid, return_key = "menu_start")});
    return;
  }
}