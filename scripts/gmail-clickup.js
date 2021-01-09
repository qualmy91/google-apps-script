function myFunction() {
  let paymentsLabel = GmailApp.getUserLabelByName("Payment");
  let todoLabel = GmailApp.getUserLabelByName("Payment/Payment-TODO");
  
  const EMAILS_TODO = todoLabel.getThreads();
  for (let i = 0; i < EMAILS_TODO.length; i++) {
    const EMAIL_TODO = EMAILS_TODO[i];
    let from = EMAIL_TODO.getMessages()[0].getFrom();
    let sender = from.split('<');
    from = sender[0];
    let subject = EMAIL_TODO.getFirstMessageSubject();
    let message = EMAIL_TODO.getMessages()[0].getPlainBody();
        
    let taskId = createTask(from, subject, message);
    
    if (taskId){
      
      let update = false;
      let i = 0;
      
      // try to update - max 3 times
      while (!update && i < 3){
        update = updateTask(taskId, from, subject, message);
        i++;
      }
      
      // check if update was sucessfull
      if (!update){
        return
      }
    }else{
      // stop script if task was not created
      return;
    }
    
    EMAIL_TODO.removeLabel(todoLabel);
    EMAIL_TODO.addLabel(paymentsLabel);
  }
}

function createTask(from, subject, message){
  
//  Create task from template
  let data = {
    'name': 'Check Payment - ' + from,
  };
  
  let options = {
    'method' : 'post',
    'contentType': 'application/json',
    'headers': { 'Authorization': API_KEY },
    'payload': JSON.stringify(data),
    'muteHttpExceptions': true,
  };
  
  let response = UrlFetchApp.fetch('https://api.clickup.com/api/v2/list/5903170/taskTemplate/t-5xrj00', options);
  let responseCode = response.getResponseCode()
  
  if (responseCode === 200) {
    let responseBody = JSON.parse(response);
    let taskId = responseBody.id;
    return taskId;
  }
  
  return false;
}

function updateTask(taskId, from, subject, message){
  
  //  Get tomorrow for due date
  let day = new Date();
  let due = new Date();
  due.setDate(day.getDate(day) + 1);
  
  let data = {
    'description': 'Subject: ' + subject + '\n\n Message:' + message,
    'due_date': due.valueOf(),
    'assignees': {
        'add': [USER_ID]
    },
  };

  let options = {
    'method' : 'put',
    'contentType': 'application/json',
    'headers': { 'Authorization': API_KEY },
    'payload': JSON.stringify(data),
    'muteHttpExceptions': true,
  };
  
  let response = UrlFetchApp.fetch('https://api.clickup.com/api/v2/task/' + taskId , options);
  let responseCode = response.getResponseCode()
  
  if (responseCode === 200) {
    return true;
  }
  
  return false;
  
}


