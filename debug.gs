function debug(TelegramJSON) {//json файл последнего действия в листе JSON
  setSheetVal('JSON', 1, 1, JSON.stringify(TelegramJSON, null, 7))
  return;
}