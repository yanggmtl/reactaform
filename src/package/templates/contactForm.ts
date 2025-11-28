import type { ReactaDefinition } from "../core/reactaFormTypes";

const contactForm: ReactaDefinition = {
  name: "contactForm",
  version: "1.0",
  displayName: "Contact form",
  properties: [
    {
      name: "fullName",
      displayName: "Full name",
      type: "string",
      defaultValue: "",
      required: true,
      tooltip: "Your first and last name",
    },
    {
      name: "email",
      displayName: "Email",
      type: "email",
      defaultValue: "",
      required: true,
      tooltip: "We will email you a confirmation",
    },
    {
      name: "phone",
      displayName: "Phone",
      type: "phone",
      defaultValue: "",
      tooltip: "Optional phone number",
    },
    {
      name: "contactReason",
      displayName: "Reason for contact",
      type: "dropdown",
      defaultValue: "support",
      options: [
        { label: "Support", value: "support" },
        { label: "Sales", value: "sales" },
        { label: "Feedback", value: "feedback" }
      ],
    },
    {
      name: "message",
      displayName: "Message",
      type: "text",
      defaultValue: "",
      required: true,
      tooltip: "Give us a short description of your request",
    }
  ],
};

export default contactForm;
