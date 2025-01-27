function msgAudio(TelegramJSON) {
  let chatid = TelegramJSON.message.chat.id;
  let userProperties = PropertiesService.getUserProperties();
  let audio = TelegramJSON.message.audio;
  let userData = JSON.parse(userProperties.getProperty(chatid));
  //let mimetype = audio.mime_type;
  Bot.sendChatAction();
  if ( audio && userData.callback_query_data === "Добавить материал") {
    let name_text = caption.split('///')[0];
    if (name_text.length > 30) {
      let msg = `⚠️<b>Название материала не должно превышать 30 символов.</b> \n\n<i>Перед основным текстом ограничьте название тремя чертами:\n<b>Например:</b>Название///Текст...</i>`;
      Bot.sendMessage(msg);
    }
    let caption = TelegramJSON.message.caption;
    let caption_text = caption.split('///')[1];
    if (caption_text.length > 1024) {
      let msg = `⚠️<b>Описание материала не должно превышать 1024 символа.</b> \n\n<i>Если у Вас большой материал: используйте @telegraph для сохрания материала в виде статьи, в сообщении боту пришлите ссылку на материал. Так материал не будет сразу отпугивать по объёму и будет наиболее читаемый в мобильных устройствах</i>`;
      Bot.sendMessage(msg);
    }
    else {//если название более 1, но менее 30 символов
      let sheet = SpreadsheetApp.openById(botSheet).getSheetByName("Instructions");
      sheet.appendRow([name_text, caption_text, audio.file_id, 'Изображение'])
      let msg = `✅ Аудио с описанием успешно добавлено. \n\n<i>Продолжайте присылать материалы для добавления,\n/menu, чтобы снова перейти в главное меню</i>`;
      //userProperties.deleteProperty(chatid);
      Bot.sendMessage(msg);
    }
    return;
  }
}