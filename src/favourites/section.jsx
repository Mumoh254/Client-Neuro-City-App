// Section.jsx
const Section = ({ children, className }) => (
    <section className={`p-4 ${className}`}>
      {children}
    </section>
  );
  
  export default Section;
  