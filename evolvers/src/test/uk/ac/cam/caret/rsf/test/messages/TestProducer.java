/*
 * Created on 8 Jan 2008
 */
package uk.ac.cam.caret.rsf.test.messages;

import java.util.GregorianCalendar;

import uk.org.ponder.rsf.bare.RequestLauncher;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.evolvers.FormatAwareDateInputEvolver;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.ViewParameters;

public class TestProducer implements ViewComponentProducer {

  public String getViewID() {
    return RequestLauncher.TEST_VIEW;
  }

  private FormatAwareDateInputEvolver dateInputEvolver;

  public void setDateInputEvolver(FormatAwareDateInputEvolver dateInputEvolver) {
    this.dateInputEvolver = dateInputEvolver;
  }

  
  public void fillComponents(UIContainer tofill, ViewParameters viewparams,
      ComponentChecker checker) {
    UIForm form = UIForm.make(tofill, "form");
    UIInput dateinput = UIInput.make(form, "date-input:", "dateHolder.date");
    dateInputEvolver.evolveDateInput(dateinput, new GregorianCalendar(2005, 6, 23).getTime());
  }
  
}
