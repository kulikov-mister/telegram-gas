function msgDoc(TelegramJSON) { // отправка документа
  let chatid = TelegramJSON.message.chat.id;
  let userProperties = PropertiesService.getUserProperties();
  let userData = JSON.parse(userProperties.getProperty(chatid));
  let document = TelegramJSON.message.document;
  let mimetype = TelegramJSON.message.document.mime_type;
  let msg, msg2 = '';
  Bot.sendChatAction();
  if (document && userData.callback_query_data === 'Добавить материал') {
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
      sheet.appendRow([TelegramJSON.message.caption.split('///')[0], TelegramJSON.message.caption.split('///')[1], document.file_id, 'Документ']);
      let msg = `Документ с описанием успешно добавлено. \n\n<i>Продолжайте присылать материалы для добавления,\n/menu, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
      return;
    }
  }
  if (document && userData.callback_query_data.includes('sendoc') ) {
    if (mimetype === 'application/pdf' || mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { //если прислали файл pdf, doc, docx
      let ur = search_row(chatid, 'users', 2);
      let dcol = search_col(userData.callback_query_data.split('_')[1], 'users', 1);
      setSheetVal('users', ur, dcol, document.file_id);
      //userProperties.deleteProperty(chatid);
      Bot.deleteMessage(TelegramJSON.message.message_id-1);
      Bot.deleteMessage(TelegramJSON.message.message_id);
      msg = `✅Документ: <b>${userData.callback_query_data.split('_')[1]}</b> успешно добавлен.`;
      Bot.sendMessage(msg);
      msg2 = '<b>Выберите документ из приведённого ниже списка👇</b>';
      userProperties.setProperty(chatid, JSON.stringify({callback_query_data: 'Отправить документы'}));
      Bot.sendMessage(msg2, {'reply_markup': getkeyFlags(chatid, return_key = "menu_start")});
      return;
    }
    else{//если прислали другой формат
      Bot.deleteMessage(TelegramJSON.message.message_id-1);
      Bot.deleteMessage(TelegramJSON.message.message_id);
      msg = `⚠️<b>Неверный формат документа.</b> \n\n<i>Поддерживаются следующие форматы:</i> \n<b>| PDF | DOC | JPEG | JPG | PNG |</b> \n\n/start - чтобы перейти в меню`;
      Bot.sendMessage(msg, {'reply_markup': {'inline_keyboard': [[{'text': '🏡 Назад', 'callback_data': 'Отправить документы'}]] } });
      return;
    }
  }
}