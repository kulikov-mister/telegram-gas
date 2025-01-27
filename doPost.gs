// https://github.com/peterherrmann/BetterLog
let Logger = BetterLog.useSpreadsheet(botSheet);
let Bot = TelegramLibrary.createBot(tgBotToken, botSheet);
let TelegramJSON;
function doPost(e) {
  if(e.postData.type == "application/json") {
    TelegramJSON = JSON.parse(e.postData.contents);
    Bot.getUpdate(TelegramJSON);

    Logger.log(JSON.stringify(TelegramJSON));
    debug(TelegramJSON); //дебаг сообщений
    
    if (Bot.isCallbackQuery()) {//если callback_query
      callbackQueryChat(TelegramJSON);
      return;
    }
    
    if (Bot.isBotCommand(TelegramJSON)) {// если команды боту
      if (Bot.isChatType('private')) {//если команда в личный чат
        msgComands(TelegramJSON);
        return;
      }
    }

    if (Bot.isTextMessage()) {// текстовые сообщения
      if (Bot.isChatType('private')) {//если в личный чат
        msgText(TelegramJSON);
        return;
      }
      else {
        msgChatText(TelegramJSON);
        return;
      }
    }

    if (Bot.isNewChatMember() || Bot.isLeftChatMember()) { //если сообщение о новом/удаленеии члене чата/группы
      Bot.deleteMessage(TelegramJSON.message.message_id); //удаление предыдущего сообщения - очистка мусора
      msgChatText(TelegramJSON);
      return
    }

    if (Bot.isPhoto()) {//если Фото
      if (Bot.isChatType('private')) {//если в личный чат
        msgPhoto(TelegramJSON);
        return;
      }
    }

    if (Bot.isDocument()) {//если Документ
      if (Bot.isChatType('private')) {//если в личный чат
        msgDoc(TelegramJSON);
        return;
      }
    }

    if (Bot.isAudio()) {//если Аудио
      if (Bot.isChatType('private')) {//если в личный чат
        msgAudio(TelegramJSON);
        return;
      }
    }

    if (Bot.isVideo()) {//если Видео
      if (Bot.isChatType('private')) {//если в личный чат
        msgVideo(TelegramJSON);
        return;
      }
    }   
  }
}
