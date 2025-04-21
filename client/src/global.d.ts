export {}

declare global {
  declare module "*.png" {
    const value: string;
    export default value;
  }

  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string
    };
  }
}
