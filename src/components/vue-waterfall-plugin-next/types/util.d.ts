export type Nullable<T> = T | null

export type CssStyleObject = Partial<CSSStyleDeclaration> & Record<string, string | null>
