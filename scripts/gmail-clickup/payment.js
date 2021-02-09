function checkPayment() {
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
        
    let taskId = createTask(from, subject, message, templateIds['payment']);
    
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
        continue;
      }
    }else{
      // stop script if task was not created
      continue;
    }
    
    EMAIL_TODO.removeLabel(todoLabel);
    EMAIL_TODO.addLabel(paymentsLabel);
  }
}
