// import React from "react";
// import { useReactaFormContext } from "../hooks/reactaFormContext";
// import type { BaseInputProps, DefinitionPropertyField } from "../core/baseTypes";
// //import { ValueColumnDiv, ValueRowDiv } from "./LayoutComponentsModules";

// export interface MultiCheckboxOption {
//   value: string;
//   label: string;
// }

// type MultiCheckboxField = DefinitionPropertyField & {
//   options: MultiCheckboxOption[];
//   height?: number;
// };

// export type MultiCheckboxProps = BaseInputProps<string[] | null, MultiCheckboxField>;


// export const MultiCheckbox: React.FC<MultiCheckboxProps> = ({
//   field,
//   value,
//   onChange,
// }) => {
//   const { t, fieldStyle, useCssVariables } = useReactaFormContext();
//   const { options } = field;
//   const height = field.height ?? 150;
//   if (!value) value = [];

//   const toggle = (val: string) => {
//     if (value.includes(val)) {
//       onChange?.(value.filter((v) => v !== val), null);
//     } else {
//       onChange?.([...value, val], null);
//     }
//   };

//   const selectAll = () => {
//     onChange?.(options.map((o) => o.value), null);
//   };

//   const deselectAll = () => {
//     onChange?.([], null);
//   };

//   return (
//     <div style={fieldStyle.container}>
//       <label style={fieldStyle.label}>{t(field.displayName)}</label>
//       <ValueColumnDiv>
//         <ValueRowDiv>
//       {/* Fixed control buttons */}
//       <div style={{ marginBottom: 8 }}>
//         <button
//           type="button"
//           onClick={selectAll}
//           style={{ marginRight: 8 }}
//         >
//           Select All
//         </button>

//         <button type="button" onClick={deselectAll}>
//           Deselect All
//         </button>
//       </div>

//       {/* Scrollable checkbox container */}
//       <div
//         style={{
//           maxHeight: height,
//           overflowY: "auto",
//           border: "1px solid #ccc",
//           padding: "8px",
//           borderRadius: "4px",
//           background: "#fff",
//         }}
//       >
//         {options.map((opt) => (
//           <label
//             key={opt.value}
//             style={{ display: "block", margin: "6px 0" }}
//           >
//             <input
//               type="checkbox"
//               checked={value.includes(opt.value)}
//               onChange={() => toggle(opt.value)}
//               disabled={opt.disabled}
//             />{" "}
//             {opt.label}
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

