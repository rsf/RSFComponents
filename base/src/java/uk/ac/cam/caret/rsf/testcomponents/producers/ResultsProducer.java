/*
 * Created on 21 Sep 2006
 */
package uk.ac.cam.caret.rsf.testcomponents.producers;

import java.text.DateFormat;

import uk.ac.cam.caret.rsf.testcomponents.beans.DataBean;
import uk.org.ponder.localeutil.LocaleGetter;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIInternalLink;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;

public class ResultsProducer implements ViewComponentProducer {

  public static final String VIEW_ID = "test-components-results";
  private LocaleGetter localegetter;
  private DataBean databean;

  public String getViewID() {
    return VIEW_ID;
  }

  public void setLocaleGetter(LocaleGetter localegetter) {
    this.localegetter = localegetter;
  }

  // This would not be injected in an OTP implementation
  public void setDataBean(DataBean databean) {
    this.databean = databean;
  }

  public void fillComponents(UIContainer tofill, ViewParameters viewparamso,
      ComponentChecker checker) {
    DateFormat format = DateFormat.getDateTimeInstance(DateFormat.LONG,
        DateFormat.LONG, localegetter.get());
    UIOutput.make(tofill, "date1", format.format(databean.date1));
    UIOutput.make(tofill, "date2", format.format(databean.date2));
    UIOutput.make(tofill, "text", null, "#{dataBean.text}");

    UIInternalLink.make(tofill, "back", new SimpleViewParameters(
        IndexProducer.VIEW_ID));
  }

}