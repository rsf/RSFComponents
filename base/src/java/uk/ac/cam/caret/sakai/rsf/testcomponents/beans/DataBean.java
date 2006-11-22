/*
 * Created on 22 Sep 2006
 */
package uk.ac.cam.caret.sakai.rsf.beans;

import java.util.Date;
import java.util.GregorianCalendar;

public class DataBean {
  public Date date1 = new Date();
  public Date date2 = new GregorianCalendar(2005, 11, 05).getTime();
  
  public String text;
  
  public String update() {
    return "updated";
  }
}
