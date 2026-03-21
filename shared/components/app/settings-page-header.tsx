type SettingsPageHeaderProps = {
  title: string;
};

export function SettingsPageHeader({ title }: SettingsPageHeaderProps) {
  return <h1 className="mb-6 text-lg font-medium text-foreground lg:text-2xl">{title}</h1>;
}
