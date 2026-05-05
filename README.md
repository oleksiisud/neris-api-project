<div align="center">
  <h1>NERIS: National Emergency Response Incident System</h1>
  <p><strong>Modernizing Fire Department Data Collection & Quality Analytics</strong></p>
</div>

---

## Frontend link: [NERIS API PROJECT FRONTEND](neris-api-proj.vercel.app)

## Overview

NERIS (National Emergency Response Incident System) is a next-generation platform designed to streamline and modernize the collection, validation, and analysis of fire department incident data across the United States. The system replaces a legacy 50-year-old process, enabling near-instantaneous data submission and analytics for millions of fire incident reports each month.

NERIS empowers local fire departments to submit structured incident data to national authorities, ensuring data quality, consistency, and compliance with federal requirements. The platform leverages advanced analytics and machine learning to identify inconsistencies between free-text narratives and structured data, supporting better funding decisions and operational insights.

---

## Project Goals

- **Accelerate Data Submission:** Replace multi-year data processing delays with real-time ingestion and validation.
- **Data Quality & Consistency:** Automatically flag missing, inconsistent, or incomplete data by comparing free-text narratives with structured fields.
- **Synthetic Data Generation:** Create realistic, schema-compliant synthetic incident payloads for model training and validation.
- **Privacy & Compliance:** Ensure no PII/PHI is submitted; support redaction and synthetic data workflows.
- **Actionable Feedback:** Provide clear, actionable feedback to data maintainers to improve submission quality.

---

## Key Features

- **Automated Data Quality Assessment:**
  - Analyze incident payloads for missing or inconsistent elements (e.g., casualties, exposures, unit responses).
  - Generate human-readable messages highlighting data issues for UI display.
  - Compute internal consistency scores for each payload.
- **Synthetic Data Tools:**
  - Generate large volumes of realistic, schema-valid incident payloads with controlled inconsistencies for model training.
- **LLM-Powered Validation:**
  - Use large language models to cross-check narrative fields against structured data.
- **Containerized & Portable:**
  - Designed for secure, portable deployment (Docker/Kubernetes).
- **OpenAPI Schema:**
  - [NERIS API Schema](https://api.neris.fsri.org/v1/openapi.json)

---

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Scikit-learn
- **Frontend:** Next.js, React.js
- **Data & Analytics:** Standard SQL, Snowflake, Pipeline Orchestration, Visualization Engines
- **Infrastructure:** AWS, Docker, Kubernetes
- **LLM/AI:** HuggingFace (planned), OpenAI integration for text analysis

---

## Example Use Cases

- **Flagging Inconsistencies:**
  - Narrative mentions three rescues, but only one is recorded in structured data.
  - Narrative specifies demographics (e.g., "70yo female"), but structured data omits these details.
  - Dispatch comments reference more units than are present in the payload.
- **Synthetic Data Generation:**
  - Generate 1000 incident payloads where narratives indicate more exposures than are present in the object tree.

---

## Project Structure & Roles

- **Project Manager:** Oleksii
- **Assistant Project Managers:** Faizan
- **Note Takers:** Kyame (Assistant), Krista (Pinned)

---

## Next Steps

1. **Data Collection:**
   - Gather firefighter incident reports (sample quality/quantity not critical at this stage).
   - Review with stakeholders to ensure suitability.
2. **Synthetic Data Generation:**
   - Develop tools to generate schema-compliant, realistic incident payloads with controlled inconsistencies.
3. **LLM Integration:**
   - Integrate and containerize LLM-based validation agents (HuggingFace/OpenAI).
4. **Algorithm Development:**
   - Design and implement scoring and feedback algorithms for data quality assessment.
5. **Deployment:**
   - Containerize and deploy the system for secure, portable use.

---

## Contributing

Interested in contributing? Please check your email for a GitHub invite and reach out to the project manager for access.

---

## References

- [NERIS API OpenAPI Schema](https://api.neris.fsri.org/v1/openapi.json)
- Example payloads and data structure documentation (see project files)

---

<div align="center">
  <em>Empowering fire departments with real-time, high-quality incident data for a safer nation.</em>
</div>
