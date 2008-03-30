/*
 * Created on 8 Jan 2008
 */
package uk.ac.cam.caret.rsf.test.messages;

import java.util.GregorianCalendar;

import uk.org.ponder.rsf.bare.RequestLauncher;
import uk.org.ponder.rsf.components.UIBranchContainer;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.evolvers.FormatAwareDateInputEvolver;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.ViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParamsReporter;

public class TestProducer implements ViewComponentProducer, ViewParamsReporter {

  public String getViewID() {
    return RequestLauncher.TEST_VIEW;
  }

  private FormatAwareDateInputEvolver dateInputEvolver;

  public void setDateInputEvolver(FormatAwareDateInputEvolver dateInputEvolver) {
    this.dateInputEvolver = dateInputEvolver;
  }

  public void fillComponents(UIContainer tofill, ViewParameters viewparamso,
      ComponentChecker checker) {

    MessagesViewParams viewparams = (MessagesViewParams) viewparamso;

    UIForm form = UIForm.make(tofill, "form");
    for (int i = 0; i < viewparams.numfields; ++i) {
      UIBranchContainer datebranch = UIBranchContainer.make(form, "date-branch:");
      UIInput dateinput = UIInput.make(datebranch, "date-input:", "dateHolder.date" + i);
      if (viewparams.invalidDateKey != null) {
        dateInputEvolver.setInvalidDateKey(viewparams.invalidDateKey);
      }
      if (viewparams.invalidTimeKey != null) {
        dateInputEvolver.setInvalidTimeKey(viewparams.invalidTimeKey);
      }
      dateInputEvolver.setStyle(viewparams.inputStyle);
      dateInputEvolver.evolveDateInput(dateinput, new GregorianCalendar(2005, 6, 23)
          .getTime());
    }
  }

  public ViewParameters getViewParameters() {
    return new MessagesViewParams();
  }

}
