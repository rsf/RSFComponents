/*
 * Created on 30 Nov 2006
 */
package uk.ac.cam.caret.rsf.evolverimpl;

import uk.org.ponder.rsf.evolvers.SelectEvolver;

/** A selection control implemented using two labelled selections */

public interface DoubleSelectEvolver extends SelectEvolver {
  public void setDestPickText(String destPickText);
  public void setSourcePickText(String sourcePickText);
}