/*
 * Created on 8 Jan 2008
 */
package uk.ac.cam.caret.rsf.test.messages;

import java.util.Date;
import java.util.GregorianCalendar;

import uk.org.ponder.messageutil.TargettedMessage;
import uk.org.ponder.messageutil.TargettedMessageList;

public class DateHolder {
  private Date date0;
  
  private TargettedMessageList targettedMessageList;

  public void setTargettedMessageList(TargettedMessageList targettedMessageList) {
    this.targettedMessageList = targettedMessageList;
  }

  public void setDate0(Date date) {
    Date limit = new GregorianCalendar(2006, 0, 1).getTime();
    if (date.after(limit)) {
      throw new IllegalArgumentException("Date cannot be after 2005");
    }
    date0 = date;
    targettedMessageList.addMessage(new TargettedMessage("info.date.set", new Object[] {date},
      TargettedMessage.SEVERITY_INFO));
  }
  
  public Date getDate0() {
    return date0;
  }
 
  public Date date1;
}
