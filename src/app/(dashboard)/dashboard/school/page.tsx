import { Section } from "@/components/utils/Section";
import { Title } from "@/components/utils/Title";
import { Image } from "@/components/utils/Image";

const DashboardPage = () => {
  return (
    <Section.Col gap="lg" full>
      <Section.Row justify="between" align="center" full>
        <Title.H1>Analytics Overview</Title.H1>
        {/* <Image.Avatar src="" alt="User avatar" width={40} height={40} /> */}
      </Section.Row>

      <Section.Grid cols={3} gap="md" responsive>
        {[{label: "1", value: "One"},{label: "2", value: "Two"}, {label: "3", value: "Three"}].map(m => (
          <div key={m.label}>
            <Title.H3>{m.label}</Title.H3>
            <Title.H2 color="primary">{m.value}</Title.H2>
          </div>
        ))}
      </Section.Grid>
    </Section.Col>
  )
}

export default DashboardPage