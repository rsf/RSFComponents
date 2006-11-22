/*
 * Created on 22 Sep 2006
 */
package uk.ac.cam.caret.sakai.rsf.beans;

import java.util.List;
import java.util.Locale;

import org.sakaiproject.tool.api.SessionManager;

import uk.org.ponder.localeutil.LocaleUtil;
import uk.org.ponder.rsf.evolvers.DateInputEvolver;
import uk.org.ponder.rsf.evolvers.TextInputEvolver;


public class ComponentChoiceBean {
  private List dateEvolvers;
  private List textEvolvers;
  private SessionManager sessionManager;
  
  public void setSessionManager(SessionManager sessionManager) {
    this.sessionManager = sessionManager;
  }

  public void setDateEvolvers(List dateEvolvers) {
    this.dateEvolvers = dateEvolvers;
  }

  public void setTextEvolvers(List textEvolvers) {
    this.textEvolvers = textEvolvers;
  }
  

  public List getTextEvolvers() {
    return textEvolvers;
  }
  
  public List getDateEvolvers() {
    return dateEvolvers;
  }
  
  
  public int dateEvolverIndex = 0;
  public int textEvolverIndex = 0;
  
  
  public TextInputEvolver getTextInputEvolver() {
    return (TextInputEvolver) textEvolvers.get(textEvolverIndex);  
  }
  
  public DateInputEvolver getDateInputEvolver() {
    return (DateInputEvolver) dateEvolvers.get(dateEvolverIndex);
  }
  
  public void setLocale(String localestring) {
    Locale locale = LocaleUtil.parseLocale(localestring);
    sessionManager.getCurrentSession().setAttribute("locale", locale);
  }
}
