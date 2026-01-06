// Barrel file to register built-in field validation handlers via side-effects
// Import each validator module so its registration runs when this file is imported.
import './validateIntegerField';
import './validateFloatField';
import './validateTextField';
import './validateEmailField';
import './validateDateField';
import './validateTimeField';
import './validateUnitValueField';
import './validateRatingField';
import './validateUrlField';
import './validatePhoneField';
import './validateSelectionFields';
import './validateColorField';

export {}; // explicit module export to keep TS happy
