/*
 * Created on 22 Sep 2006
 */

package uk.ac.cam.caret.rsf.testcomponents.beans;

import java.util.Locale;

import uk.org.ponder.beanutil.BeanLocator;
import uk.org.ponder.localeutil.LocaleSetter;
import uk.org.ponder.localeutil.LocaleUtil;
import uk.org.ponder.rsf.evolvers.DateInputEvolver;
import uk.org.ponder.rsf.evolvers.SelectEvolver;
import uk.org.ponder.rsf.evolvers.TextInputEvolver;
import uk.org.ponder.stringutil.StringList;


public class ComponentChoiceManager {
  private StringList dateEvolvers;
  private StringList textEvolvers;
  private StringList selectEvolvers;
  private LocaleSetter localeSetter;
  
  private BeanLocator rbg;

  private ComponentSelectionBean ccb;
  
  public StringList getSelectEvolvers() {
    return selectEvolvers;
  }

  public void setSelectEvolvers(StringList selectEvolvers) {
    this.selectEvolvers = selectEvolvers;
  }

  public void setLocaleSetter(LocaleSetter localeSetter) {
    this.localeSetter = localeSetter;
  }
  
  public void setDateEvolvers(StringList dateEvolvers) {
    this.dateEvolvers = dateEvolvers;
  }

  public void setTextEvolvers(StringList textEvolvers) {
    this.textEvolvers = textEvolvers;
  }

  public StringList getTextEvolvers() {
    return textEvolvers;
  }
  
  public StringList getDateEvolvers() {
    return dateEvolvers;
  }
  
  public void setRequestBeanLocator(BeanLocator rbg) {
    this.rbg = rbg;
  }
 
  public void setComponentChoiceBean(ComponentSelectionBean ccb) {
    this.ccb = ccb;
  }
  
  public TextInputEvolver getTextInputEvolver() {
    return (TextInputEvolver) rbg.locateBean(textEvolvers.stringAt(ccb.textEvolverIndex));  
  }
  
  public DateInputEvolver getDateInputEvolver() {
    return (DateInputEvolver) rbg.locateBean(dateEvolvers.stringAt(ccb.dateEvolverIndex));
  }
  
  public SelectEvolver getSelectEvolver() {
    return (SelectEvolver) rbg.locateBean(selectEvolvers.stringAt(ccb.selectEvolverIndex));
  }
  
  public void setLocale(String localestring) {
    Locale locale = LocaleUtil.parseLocale(localestring);
    localeSetter.setLocale(locale);
  }

}
