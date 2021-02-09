function createTask(from, subject, message, templateId){
  
  let taskTitle = '';

  if (templateId == templateIds['payment']){
    taskTitle = 'Check Payment - ';
  } else if (templateId == templateIds['invoice']){
    taskTitle = 'Create Invoice - ';
  } else if (templateId == templateIds['expense']){
    taskTitle = 'Create Expense -';
  }

//  Create task from template
  let data = {
    'name': taskTitle + from,
  };
  
  let options = {
    'method' : 'post',
    'contentType': 'application/json',
    'headers': { 'Authorization': API_KEY },
    'payload': JSON.stringify(data),
    'muteHttpExceptions': true,
  };
  
  let response = UrlFetchApp.fetch('https://api.clickup.com/api/v2/list/5903170/taskTemplate/' + templateId , options);
  let responseCode = response.getResponseCode()
  
  if (responseCode === 200) {
    let responseBody = JSON.parse(response);
    let taskId = responseBody.id;
    return taskId;
  }
  
  return false;
}

function updateTask(taskId, from, subject, message, dueDays = 1){
  
  //  Get tomorrow for due date
  let day = new Date();
  let due = new Date();
  due.setDate(day.getDate(day) + dueDays);
  
  let data = {
    'due_date': due.valueOf(),
    'assignees': {
        'add': [5782250]
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
    let comment = false;
    for (i = 0; i < 3 && !comment; i++){
      comment = addComment(taskId, subject, message);
    }
    return true;
  }
  
  return false;
  
}

function addComment(taskId, subject, message) {

  let data = {
    'comment_text': 'Subject: ' + subject + '/n/nMessage:/n' + message,
  };

  let options = {
    'method' : 'POST',
    'contentType': 'application/json',
    'headers': { 'Authorization': API_KEY },
    'payload': JSON.stringify(data),
    'muteHttpExceptions': true,
  };
  
    let response = UrlFetchApp.fetch('https://api.clickup.com/api/v2/task/' + taskId + '/comment', options);
    let responseCode = response.getResponseCode()
    
    if (responseCode === 200) {
      return true;
    } 
    
    return false;

    }   
