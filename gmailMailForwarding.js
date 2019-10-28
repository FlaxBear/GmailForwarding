// Global

// Forwarding address
var forwardingAddress = "example@gmail.com";

// createDate Function keyword list
var createDateKeywordsList = Array(
  {"keyword": "companyMailForwardingMorning", "type": "add", "day": "0/0/1", "date": "11:00"},
  {"keyword": "companyMailForwardingAfter", "type": "add", "day": "0/0/0", "date": "18:00"}
);

// ==========================================================================================================
// System
// Trigger function info
var triggerFunctionList = Array(
	'companyMailForwarding'
);

// Name: clearTrigger
// Description: Clear userd trigger function
// Input: None
// Output: None
function clearTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i = 0; i < triggers.length; i++) {
	if(triggerFunctionList.indexOf(triggers[i].getHandlerFunction()) != -1){
		ScriptApp.deleteTrigger(triggers[i]);
	}
  }
  return;
}

// Name: resetTrigger
// Description: Reset trigger function
// Input: None
// Output: None
function resetTrigger(keyword) {
  var date = createDate({"keyword": keyword});
  ScriptApp.newTrigger(triggerFunctionList[0]).timeBased().at(date).create();
  return;
}

// Name: createDate
// Description: Create date data
// Input: dict Dictionary
// Output: date Date
function createDate(dict) 
{
  var outputDate = new Date();
  if(dict.keyword) 
  {
    for(var listCount = 0; listCount < createDateKeywordsList.length; listCount++) 
    {
      if(dict.keyword == createDateKeywordsList[listCount].keyword) 
      {
        var dayData = createDateKeywordsList[listCount].day.split('/');
        var timeData = createDateKeywordsList[listCount].date.split(':');
        if(createDateKeywordsList[listCount].type == "set") 
        {
          // type: set
          outputDate.setFullYear(dayData[0]);
          outputDate.setMonth(dayData[1]);
          outputDate.setDate(dayData[2]);
        } 
        else if (createDateKeywordsList[listCount].type == "add") 
        {
          // type: add
          outputDate.setFullYear(outputDate.getFullYear() + Number(dayData[0]));
          outputDate.setMonth(outputDate.getMonth() + Number(dayData[1]));
          outputDate.setDate(outputDate.getDate() + Number(dayData[2]));
        }
      }
    }
  } 
  else 
  {
    var dayData = dict.day.split('/');
    var timeData = dict.date.split(':');
    if(dict.type == "set")
    {
      // type: set
      outputDate.setFullYear(dayData[0]);
      outputDate.setMonth(dayData[1]);
      outputDate.setDate(dayData[2]);
    } 
    else if (dict.type == "add") 
    {
      // type: add
      outputDate.setFullYear(outputDate.getFullYear() + Number(dayData[0]));
      outputDate.setMonth(outputDate.getMonth() + Number(dayData[1]));
      outputDate.setDate(outputDate.getDate() + Number(dayData[2]));
    }
  }
  
  outputDate.setHours(timeData[0]);
  outputDate.setMinutes(timeData[1]);
  return outputDate;
}
// ==========================================================================================================

// Name: getReceivedGmail
// Description: Get a list of unread emails
// Input: None
// Output: None
function getReceivedGmail()
{ 
  var threads = GmailApp.search("has:nouserlabels is:unread", 0, 500);
  var mailList = GmailApp.getMessagesForThreads(threads); 
  
  for(var i = 0; i < mailList.length; i++) {
    var sendMailInfo = [];
    sendMailInfo[0] = mailList[i][0].getDate();
    sendMailInfo[1] = mailList[i][0].getReplyTo();
    sendMailInfo[2] = mailList[i][0].getSubject();
    sendMailInfo[3] = mailList[i][0].getFrom();
    sendMailInfo[4] = mailList[i][0].getPlainBody();
    sendReceivedGmail(sendMailInfo);
    threads[i].markRead();
  }
  return;
}

// Name: sendReceivedGmail
// Description: Forward based on email information
// Input: None
// Output: None
function sendReceivedGmail(sendMailInfo)
{
  var date = getNowYMD();
  var subject = "[転送_" + date + "]" + sendMailInfo[2];
  var body = "日付:" + sendMailInfo[0] + "\n";
  body += "送信者:" + sendMailInfo[3] + "\n";
  body += "\n\n";
  body += sendMailInfo[4];
  GmailApp.sendEmail(forwardingAddress, subject, body);
  return;
}

// Name: CompanyMailForwarding
// Description: Main
// Input: None
// Output: None
function companyMailForwarding() 
{
  // Clear trigger
  clearTrigger();
  // Get and send received email
  getReceivedGmail();
  
  // Reset trigger
  var now = new Date();
  var keyword = "";
  if(now.getHours() <= 12) {
    keyword = "companyMailForwardingAfter";
  } else {
    keyword = "companyMailForwardingMorning";
  }
  resetTrigger(keyword);
  return;
}
// ==========================================================================================================

// ==========================================================================================================
// https://javascript.programmer-reference.com/js-date-format-yyyymmdd/
// ==========================================================================================================
function getNowYMD(){
  var dt = new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "/" + m + "/" + d;
  return result;
}