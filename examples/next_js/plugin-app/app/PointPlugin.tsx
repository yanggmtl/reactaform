import type { ReactaFormPlugin, TranslationFunction, ReactaDefinition } from 'reactaform';
import Point2DInput from './Point2DInput';
import Point3DInput from './Point3DInput';

/**
 * Extracted form validator for region checks.
 * Returns an array of error messages (empty when valid).
 */
function regionValidator(valuesMap: Record<string, unknown>, t: TranslationFunction): string[] {
  const errors: string[] = [];
  const pos2d_1 = valuesMap['pos2d_1'] as string[] | undefined;
  const pos2d_2 = valuesMap['pos2d_2'] as string[] | undefined;
  if (pos2d_1 && pos2d_2) {
    const x1 = parseFloat(pos2d_1[0]);
    const y1 = parseFloat(pos2d_1[1]);
    const x2 = parseFloat(pos2d_2[0]);
    const y2 = parseFloat(pos2d_2[1]);
    if (x1 >= x2 || y1 >= y2) {
      errors.push(t("Top Left Position must be above and to the left of Bottom Right Position."));
    }
  }
  return errors;
}

/** Field validator ensuring all coordinates are non-negative. */
function positivePosition(fieldName: string, value: unknown, t: TranslationFunction): string | undefined {
  void fieldName;
  const point = value as string[] | undefined;
  if (point) {
    const x = parseFloat(point[0]);
    const y = parseFloat(point[1]);
    const z = point.length > 2 ? parseFloat(point[2]) : 0;
    if (x < 0 || y < 0 || z < 0) {
      return t("Position coordinates must be positive.");
    }
  }
  return undefined;
}

function alertSubmissionHandler(
  definition: ReactaDefinition,
  instanceName: string | null,
  valuesMap: Record<string, unknown>,
  t: TranslationFunction
): string[] | undefined {
  void definition;
  void instanceName;
  alert(t("Form submitted with values: ") + JSON.stringify(valuesMap, null, 2));
  return undefined;
}

export const PointPlugin: ReactaFormPlugin = {
  name: 'point_plugin',
  version: '0.1.0',
  description: 'A ReactaForm Plugin for point 2d and 3d',

  /** Register a sample component */
  components: {
    point2d: Point2DInput as unknown as React.ComponentType<unknown>,
    point3d: Point3DInput as unknown as React.ComponentType<unknown>,
  },

  /** Register a sample field validator */
  fieldCustomValidators: {
    point: {
      positivePosition: positivePosition,
    },
  },

  /** Register a sample form validator */
  formValidators: {
    regionValidator : regionValidator,
  },

  /** Register a sample submission handler */
  submissionHandlers: {
    alertSubmission: alertSubmissionHandler,
  },

  setup: () => {
    console.log('Point_plugin registered');
  },

  cleanup: () => {
    console.log('Point_plugin unregistered');
  },
};
