# Localization

Localization (i18n) is central to building apps that support multiple languages and regional formats.


## localization mechanisms

ReactaForm supports two localization approaches:

1. **Built-in translations**
   - The package includes default keys and translations for UI text and validation messages.

2. **Custom translations**
   - Applications may supply a custom dictionary (per-locale JSON) to override or extend built-in keys.

Translation resolution

- The `t()` helper resolves keys by first checking the application's custom dictionary (if provided), then falling back to the built-in translations supplied by the library.
- If a key is missing from both sources, the renderer may return the key itself or a configured fallback string.

## Supported Languages

This project provides builtin messages localization support for the following languages:
| Abbr | Name | Native Name |
| --- | --- | --- |
| en | English | English |
| fr | French | Français |
| de | German | Deutsch |
| es | Spanish | Español |
| zh-cn | Chinese (Simplified) | 简体中文 |
| zh-tw | Chinese (Traditional) | 繁體中文 |
| bg | Bulgarian | Български |
| cs | Czech | Čeština |
| da | Danish | Dansk |
| el | Greek | Ελληνικά |
| fi | Finnish | Suomi |
| hi | Hindi | हिन्दी |
| hu | Hungarian | Magyar |
| id | Indonesian | Bahasa Indonesia |
| it | Italian | Italiano |
| ja | Japanese | 日本語 |
| ko | Korean | 한국어 |
| ms | Malay | Bahasa Melayu |
| nl | Dutch | Nederlands |
| no | Norwegian | Norsk |
| pl | Polish | Polski |
| pt | Portuguese | Português |
| ro | Romanian | Română |
| ru | Russian | Русский |
| sk | Slovak | Slovenčina |
| sv | Swedish | Svenska |
| th | Thai | ไทย |
| tr | Turkish | Türkçe |
| uk | Ukrainian | Українська |
| vi | Vietnamese | Tiếng Việt |

The builtin messsages of first 5 languages can be found in ReactaForm library and others can be found in `https://reactaform.com/locales/<abbr>/common.json`.

## Translation Features

- **Label translation**

   Field labels (`displayName`), tooltips, and placeholder text are passed through the `t()` function automatically. Use message keys in your schema to enable translations and previews in the builder.

   Example:

   ```json
   { "displayName": "Contact Name" }
   ```

- **Error message translation**

   Validation messages are produced as translatable keys by built-in validators; you may override them per-field (for example `patternErrorMessage`, `requiredMessage`) or return keys from custom validators.

   Example:

   ```json
   { "pattern": "^\\[0-9]{5}$", "patternErrorMessage": "ZIP code must be exactly 5 digits (0–9)" }
   ```

- **Option label translation**

   For choice fields (`dropdown`, `radio`, `multi-selection`) keep `value` language-independent and translate `label`. Labels may be message keys resolved at render time.

   Example:

   ```json
   "options": [ { "label": "United States", "value": "us" }, { "label": "Canada", "value": "ca" } ]
   ```

## Custom Localization Mechanism

Follow these steps to provide custom, per-form localization dictionaries that the builder and renderer will load automatically:

1. Provide a translation dictionary
   - Place files under `public/locales/<abbr>/<localizationName>.json`.
   - Example: `public/locales/fr/my_form_translations.json`.

2. Reference it in your form
   - In the form definition JSON, set the `localization` property to the `<localizationName>` you created.
   - Example:

```json
{
  "name": "contact",
  "localization": "my_form_translations",
  "properties": [ /* ... */ ]
}
```

3. ReactaForm loads automatically
   - When the app/provider initializes, the form renderer will attempt to load `public/locales/<abbr>/<localizationName>.json` and merge it with the global dictionary.
   - Authors can ship multiple localizationName files per language and reference them per-form to customize labels and messages.

Place locale JSON files under `public/locales/<abbr>/` and ensure your app provider loads the appropriate files for the current locale.

Note: All language message translation files are translated by AI and if you find any improper translation, please contact us.