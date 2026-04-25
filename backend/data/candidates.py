"""25 richly detailed mock candidate profiles — anime character names, INR salaries, 0-3 yrs exp."""

CANDIDATES = [
    {
        "id": "C001",
        "name": "Naruto Uzumaki",
        "title": "Full Stack Engineer",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "GraphQL", "Redis"],
        "summary": "Energetic full-stack engineer with 2 years building scalable web applications. Contributed to two early-stage startups. Fast learner with strong React ecosystem knowledge and cloud-native basics.",
        "education": "B.Tech Computer Science, NIT Warangal",
        "previous_companies": ["StartupX", "Infosys (intern)"],
        "achievements": [
            "Reduced API response time by 40% using Redis caching",
            "Built REST API serving 50K daily users",
            "Open source contributor with 300+ GitHub stars"
        ],
        "expected_salary_inr": 700000,
        "open_to_remote": True,
        "email": "naruto.uzumaki@gmail.com"
    },
    {
        "id": "C002",
        "name": "Mikasa Ackerman",
        "title": "Machine Learning Engineer",
        "location": "Hyderabad, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "SQL", "MLflow", "FastAPI"],
        "summary": "ML engineer with 3 years specializing in NLP and computer vision. Built production ML pipelines serving thousands of daily predictions. Strong background in both research and engineering.",
        "education": "M.Tech AI/ML, IIIT Hyderabad",
        "previous_companies": ["Analytics Vidhya (intern)", "Fractal AI"],
        "achievements": [
            "Deployed NLP model reducing support tickets by 25%",
            "Published 1 paper at a national AI conference",
            "Kaggle Expert (top 15% globally)"
        ],
        "expected_salary_inr": 900000,
        "open_to_remote": True,
        "email": "mikasa.ackerman@gmail.com"
    },
    {
        "id": "C003",
        "name": "Levi Ackerman",
        "title": "DevOps / Platform Engineer",
        "location": "Pune, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Kubernetes", "Terraform", "AWS", "Docker", "Jenkins", "Python", "Prometheus"],
        "summary": "Platform engineer with 2 years of experience in cloud infrastructure and CI/CD pipelines. Built automated deployment systems for fintech applications. Precision-focused and detail-oriented.",
        "education": "B.E. Information Technology, Pune University",
        "previous_companies": ["Juspay (intern)", "Freelance"],
        "achievements": [
            "Reduced infrastructure costs by 20% through spot instance optimization",
            "Achieved 99.9% uptime for payment processing platform",
            "AWS Cloud Practitioner certified"
        ],
        "expected_salary_inr": 650000,
        "open_to_remote": False,
        "email": "levi.ackerman@gmail.com"
    },
    {
        "id": "C004",
        "name": "Erza Scarlet",
        "title": "Product Manager - AI/ML Products",
        "location": "Mumbai, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Product Strategy", "Data Analysis", "SQL", "A/B Testing", "Roadmapping", "Agile", "User Research"],
        "summary": "PM with 3 years shipping AI-powered features from concept to launch. Bridges technical ML teams and business stakeholders. Strong data intuition with hands-on SQL skills.",
        "education": "MBA, NMIMS Mumbai; B.Tech, NIT Trichy",
        "previous_companies": ["PhonePe (intern)", "EdTech startup"],
        "achievements": [
            "Launched AI-powered recommendation feature growing DAU by 15%",
            "Improved user retention by 18% through ML-driven personalization",
            "Coordinated product team of 5 across engineering and design"
        ],
        "expected_salary_inr": 1100000,
        "open_to_remote": True,
        "email": "erza.scarlet@gmail.com"
    },
    {
        "id": "C005",
        "name": "Killua Zoldyck",
        "title": "Backend Engineer - Go & Distributed Systems",
        "location": "Chennai, India",
        "experience_years": 1,
        "experience_level": "Junior",
        "skills": ["Go", "Kafka", "gRPC", "PostgreSQL", "Redis", "Docker", "AWS"],
        "summary": "Backend engineer with 1 year focused on high-throughput distributed systems. Built real-time data pipelines for an early-stage startup. Passionate about performance engineering and low-latency systems.",
        "education": "B.Tech CSE, NIT Calicut",
        "previous_companies": ["Zepto (intern)"],
        "achievements": [
            "Built event streaming PoC processing 10K msgs/sec",
            "Reduced p99 latency from 500ms to 120ms on key API",
            "Contributed to open-source Go libraries"
        ],
        "expected_salary_inr": 600000,
        "open_to_remote": True,
        "email": "killua.zoldyck@gmail.com"
    },
    {
        "id": "C006",
        "name": "Hinata Hyuga",
        "title": "Data Scientist - NLP Specialist",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Python", "NLP", "BERT", "LangChain", "Hugging Face", "SQL", "Tableau"],
        "summary": "Data scientist with 2 years in NLP and conversational AI. Built chatbots and document intelligence systems for small enterprises. Strong in model development and presenting results to stakeholders.",
        "education": "M.Sc Statistics, IISc Bangalore",
        "previous_companies": ["Accenture AI (intern)", "Analytics firm"],
        "achievements": [
            "Built multilingual FAQ bot for a regional e-commerce client",
            "Improved document classification accuracy from 72% to 89%",
            "Led NLP project with a team of 3 interns"
        ],
        "expected_salary_inr": 750000,
        "open_to_remote": True,
        "email": "hinata.hyuga@gmail.com"
    },
    {
        "id": "C007",
        "name": "Sasuke Uchiha",
        "title": "Frontend Engineer - React & Next.js",
        "location": "Delhi, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Jest", "Figma"],
        "summary": "Frontend engineer with 3 years crafting performant user interfaces. Contributed to a design system used by 50+ engineers. Strong in accessibility, animations, and Core Web Vitals optimization.",
        "education": "B.Tech ECE, Delhi Technological University",
        "previous_companies": ["Meesho", "OYO (intern)"],
        "achievements": [
            "Improved Lighthouse score from 55 to 94",
            "Built component library adopted across 3 product teams",
            "Reduced bundle size by 35% through code splitting"
        ],
        "expected_salary_inr": 800000,
        "open_to_remote": True,
        "email": "sasuke.uchiha@gmail.com"
    },
    {
        "id": "C008",
        "name": "Rem Rezero",
        "title": "AI Engineer - LLM Applications",
        "location": "Bangalore, India",
        "experience_years": 1,
        "experience_level": "Junior",
        "skills": ["Python", "PyTorch", "Transformers", "LangChain", "RAG", "Vector DBs", "FastAPI"],
        "summary": "AI engineer with 1 year building LLM-powered applications. Experience with prompt engineering and building RAG pipelines for small enterprise use cases. Strong research background from college projects.",
        "education": "M.Tech AI, IIIT Hyderabad",
        "previous_companies": ["Sarvam AI (intern)"],
        "achievements": [
            "Built a RAG chatbot for legal FAQ with 82% accuracy",
            "Prompt-optimized LLM pipeline reducing token costs by 30%",
            "1st place at college-level AI hackathon"
        ],
        "expected_salary_inr": 650000,
        "open_to_remote": True,
        "email": "rem.rezero@gmail.com"
    },
    {
        "id": "C009",
        "name": "Gon Freecss",
        "title": "Data Engineer - AWS & Spark",
        "location": "Pune, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Apache Spark", "AWS Glue", "Airflow", "Python", "dbt", "Kafka", "SQL"],
        "summary": "Data engineer with 2 years building reliable data pipelines. Designed and implemented ETL workflows for a mid-size analytics team. Enthusiastic about modern data stacks.",
        "education": "B.E. CS, VIT Pune",
        "previous_companies": ["Myntra (intern)", "Data consultancy"],
        "achievements": [
            "Built ETL pipeline processing 100GB/day for analytics team",
            "Reduced ETL pipeline failures by 60%",
            "Migrated legacy CSV pipelines to dbt-based Snowflake workflows"
        ],
        "expected_salary_inr": 720000,
        "open_to_remote": False,
        "email": "gon.freecss@gmail.com"
    },
    {
        "id": "C010",
        "name": "Nobara Kugisaki",
        "title": "Security Engineer",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Penetration Testing", "AWS Security", "OWASP", "Python", "Burp Suite", "SOC2 basics"],
        "summary": "Security engineer with 2 years in cloud security and application penetration testing. Helped 2 startups identify critical vulnerabilities. Passionate about ethical hacking and CTFs.",
        "education": "B.Tech CSE, BITS Pilani",
        "previous_companies": ["CloudSEK (intern)", "Freelance bug bounty"],
        "achievements": [
            "Identified XSS and IDOR vulnerabilities in 2 production platforms",
            "Assisted SOC2 readiness audit for an early-stage SaaS",
            "OSCP certification in progress"
        ],
        "expected_salary_inr": 850000,
        "open_to_remote": True,
        "email": "nobara.kugisaki@gmail.com"
    },
    {
        "id": "C011",
        "name": "Tanjiro Kamado",
        "title": "Android Engineer",
        "location": "Ahmedabad, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Kotlin", "Jetpack Compose", "Android SDK", "Room", "Coroutines", "Hilt", "Firebase", "Retrofit"],
        "summary": "Android engineer with 3 years building consumer apps. Strong in modern Android architecture patterns and performance optimization. Shipped 2 apps with 100K+ downloads.",
        "education": "B.Tech IT, DAIICT",
        "previous_companies": ["CRED (intern)", "AgriTech startup"],
        "achievements": [
            "Built rewards UI for a fintech app with 200K active users",
            "Reduced app crash rate from 2.5% to 0.3%",
            "App featured in Google Play New Arrivals"
        ],
        "expected_salary_inr": 780000,
        "open_to_remote": True,
        "email": "tanjiro.kamado@gmail.com"
    },
    {
        "id": "C012",
        "name": "Zero Two",
        "title": "iOS Engineer",
        "location": "Hyderabad, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Swift", "SwiftUI", "Core Data", "Combine", "XCTest", "Firebase", "AVFoundation"],
        "summary": "iOS engineer with 2 years crafting beautiful mobile experiences. Built apps with 50K+ total downloads. Loves SwiftUI and reactive programming patterns.",
        "education": "B.Tech CSE, Osmania University",
        "previous_companies": ["ShareChat (intern)", "EdTech startup"],
        "achievements": [
            "Shipped video streaming feature for a 300K MAU education app",
            "Reduced app binary size by 25% through asset optimization",
            "Won college-level Apple Innovation Challenge"
        ],
        "expected_salary_inr": 700000,
        "open_to_remote": True,
        "email": "zero.two@gmail.com"
    },
    {
        "id": "C013",
        "name": "Itadori Yuji",
        "title": "Site Reliability Engineer (SRE)",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["SRE", "Kubernetes", "Prometheus", "Grafana", "Python", "PagerDuty"],
        "summary": "SRE with 2 years focused on availability and operational excellence. Defined SLOs for systems serving 500K users. Enjoys incident response and improving system observability.",
        "education": "B.E. ECE, Anna University",
        "previous_companies": ["Zoho (intern)", "SaaS startup"],
        "achievements": [
            "Maintained 99.95% uptime for a SaaS platform over 6 months",
            "Reduced MTTR from 60 min to 15 min through better alerting",
            "Set up Grafana dashboards used across 3 teams"
        ],
        "expected_salary_inr": 780000,
        "open_to_remote": True,
        "email": "itadori.yuji@gmail.com"
    },
    {
        "id": "C014",
        "name": "Yor Forger",
        "title": "UX / Product Designer",
        "location": "Bangalore, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing", "Framer"],
        "summary": "Product designer with 3 years shipping user-centered designs. Led UX for products used by 500K+ users. Specializes in mobile-first design and complex data dashboards.",
        "education": "B.Des Visual Communication, NID Ahmedabad",
        "previous_companies": ["Navi (intern)", "D2C startup"],
        "achievements": [
            "Redesigned onboarding flow increasing activation rate by 18%",
            "Won college design award for UX innovation",
            "Built design system with 80+ components"
        ],
        "expected_salary_inr": 750000,
        "open_to_remote": True,
        "email": "yor.forger@gmail.com"
    },
    {
        "id": "C015",
        "name": "Shoyo Hinata",
        "title": "Blockchain / Web3 Engineer",
        "location": "Delhi, India",
        "experience_years": 1,
        "experience_level": "Junior",
        "skills": ["Solidity", "Ethereum", "Hardhat", "React", "TypeScript", "IPFS", "ethers.js"],
        "summary": "Web3 engineer with 1 year building DeFi and NFT projects. Strong Solidity fundamentals and familiarity with EVM chains. Also comfortable with React-based Web3 frontends.",
        "education": "B.Tech CS, Delhi University",
        "previous_companies": ["CoinDCX (intern)"],
        "achievements": [
            "Reviewed smart contracts for a small DeFi project",
            "Built a simple token swap UI using ethers.js",
            "ETHIndia 2023 finalist"
        ],
        "expected_salary_inr": 600000,
        "open_to_remote": True,
        "email": "shoyo.hinata@gmail.com"
    },
    {
        "id": "C016",
        "name": "Megumin Explosion",
        "title": "Java Backend Engineer",
        "location": "Noida, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL", "Redis", "AWS", "JUnit"],
        "summary": "Java engineer with 3 years in enterprise backend development. Built APIs and microservices for banking and fintech platforms. Strong in designing fault-tolerant services and writing clean, testable code.",
        "education": "MCA, Symbiosis Institute, Pune",
        "previous_companies": ["Mphasis (intern)", "Fintech startup"],
        "achievements": [
            "Built payment API serving 100K transactions/month",
            "Reduced system downtime by 40% through circuit breakers",
            "Mentored 3 junior interns on Spring Boot best practices"
        ],
        "expected_salary_inr": 850000,
        "open_to_remote": False,
        "email": "megumin.explosion@gmail.com"
    },
    {
        "id": "C017",
        "name": "Edward Elric",
        "title": "Full Stack Engineer - Python & React",
        "location": "Kolkata, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Python", "Django", "React", "PostgreSQL", "Docker", "Celery", "Redis", "REST APIs"],
        "summary": "Full-stack engineer who ships fast and learns faster. Built SaaS products end-to-end in 2 years. Strong in Python/Django backend and React frontend. Cares deeply about clean code and testing.",
        "education": "B.Tech CSE, Jadavpur University",
        "previous_companies": ["Recko (intern)", "Freelance"],
        "achievements": [
            "Built invoicing module processing 10K invoices/month",
            "90%+ test coverage on critical payment module",
            "Personal SaaS project reached ₹40K MRR in 5 months"
        ],
        "expected_salary_inr": 550000,
        "open_to_remote": True,
        "email": "edward.elric@gmail.com"
    },
    {
        "id": "C018",
        "name": "Aqua Goddess",
        "title": "Cloud & DevOps Engineer",
        "location": "Trivandrum, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["GCP", "Azure", "Terraform", "Kubernetes", "Python", "BigQuery", "Pub/Sub"],
        "summary": "Cloud engineer with 3 years helping startups move to cloud-native architectures. Strong in cost optimization and infrastructure automation. Holds 3 active cloud certifications.",
        "education": "B.Tech CSE, Kerala University",
        "previous_companies": ["Wipro (intern)", "SaaS startup"],
        "achievements": [
            "Migrated on-prem MySQL to GCP saving ₹8L/year",
            "Designed multi-region DR setup with RPO < 5 minutes",
            "3 certifications: AWS, GCP, Azure fundamentals"
        ],
        "expected_salary_inr": 900000,
        "open_to_remote": True,
        "email": "aqua.goddess@gmail.com"
    },
    {
        "id": "C019",
        "name": "Kazuto Kirigaya",
        "title": "GenAI / LLM Engineer",
        "location": "Bangalore, India",
        "experience_years": 1,
        "experience_level": "Junior",
        "skills": ["Python", "LangChain", "OpenAI API", "Gemini", "RAG", "Pinecone", "FastAPI", "Prompt Engineering"],
        "summary": "GenAI engineer with 1 year building production LLM applications. Shipped 2 AI products using LangChain and various LLM providers. Strong focus on RAG architectures and prompt optimization.",
        "education": "B.Tech CS, PES University",
        "previous_companies": ["Sarvam AI (intern)"],
        "achievements": [
            "Built legal AI assistant reducing contract review time by 50%",
            "Prompt optimization improved response quality by 30%",
            "1st at Google GenAI Hackathon India 2024"
        ],
        "expected_salary_inr": 600000,
        "open_to_remote": True,
        "email": "kazuto.kirigaya@gmail.com"
    },
    {
        "id": "C020",
        "name": "Asuna Yuuki",
        "title": "Data Scientist",
        "location": "Hyderabad, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Python", "Machine Learning", "Deep Learning", "Statistics", "SQL", "Spark"],
        "summary": "Data scientist with 3 years applying ML to business problems across retail and fintech. Known for translating complex model outputs into actionable business recommendations.",
        "education": "M.Sc Statistics, University of Hyderabad",
        "previous_companies": ["Walmart Labs (intern)", "D2C analytics startup"],
        "achievements": [
            "Built churn prediction model with 85% precision for a SaaS client",
            "Led 3-person data science team on a recommendation system",
            "Published blog series on ML in production (2K+ reads)"
        ],
        "expected_salary_inr": 950000,
        "open_to_remote": True,
        "email": "asuna.yuuki@gmail.com"
    },
    {
        "id": "C021",
        "name": "Rock Lee",
        "title": "QA Engineer - Automation",
        "location": "Jaipur, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Selenium", "Cypress", "Python", "Playwright", "REST API Testing", "JMeter", "TestRail"],
        "summary": "QA automation engineer with 2 years building test frameworks from scratch. Reduced manual testing effort by 60% at two companies through disciplined automation. Detail-oriented and persistent.",
        "education": "B.Tech CSE, Manipal University",
        "previous_companies": ["BrowserStack (intern)", "SaaS startup"],
        "achievements": [
            "Built E2E automation suite with 500+ tests running in CI",
            "Reduced regression cycle from 2 days to 3 hours",
            "Zero-defect release for 3 consecutive sprints"
        ],
        "expected_salary_inr": 500000,
        "open_to_remote": True,
        "email": "rock.lee@gmail.com"
    },
    {
        "id": "C022",
        "name": "Violet Evergarden",
        "title": "Technical Writer & Developer Advocate",
        "location": "Bangalore, India",
        "experience_years": 2,
        "experience_level": "Junior",
        "skills": ["Technical Writing", "API Documentation", "Python", "Markdown", "Developer Relations", "Git"],
        "summary": "Technical writer with 2 years creating developer documentation and tutorials. Experience with REST API docs, SDK guides, and blog content for engineering audiences. Precise and empathetic communicator.",
        "education": "B.A. English Literature + CS Minor, Christ University Bangalore",
        "previous_companies": ["Postman (intern)", "Developer tools startup"],
        "achievements": [
            "Rewrote SDK documentation reducing developer onboarding time by 40%",
            "Published 10+ technical tutorials with 50K+ combined views",
            "Created OpenAPI specs for a 30-endpoint REST API"
        ],
        "expected_salary_inr": 520000,
        "open_to_remote": True,
        "email": "violet.evergarden@gmail.com"
    },
    {
        "id": "C023",
        "name": "Shoto Todoroki",
        "title": "Embedded Systems Engineer",
        "location": "Kochi, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["C", "C++", "RTOS", "Linux Kernel", "ARM Cortex", "CAN Bus", "Python"],
        "summary": "Embedded systems engineer with 3 years specializing in IoT and automotive firmware. Expert in real-time operating systems and low-level hardware programming. Calm, methodical, and detail-driven.",
        "education": "B.Tech Electronics, NIT Calicut",
        "previous_companies": ["Bosch India (intern)", "IoT startup"],
        "achievements": [
            "Developed IoT firmware deployed on 5K devices",
            "Reduced boot time by 25% for an industrial sensor system",
            "Built BLE communication module for wearable device"
        ],
        "expected_salary_inr": 820000,
        "open_to_remote": False,
        "email": "shoto.todoroki@gmail.com"
    },
    {
        "id": "C024",
        "name": "Nami Weatheria",
        "title": "Growth & Marketing Data Analyst",
        "location": "Mumbai, India",
        "experience_years": 1,
        "experience_level": "Junior",
        "skills": ["SQL", "Python", "Google Analytics", "Mixpanel", "Looker", "A/B Testing", "Excel"],
        "summary": "Data analyst with 1 year at the intersection of marketing and data science. Specializes in funnel analysis, cohort analysis, and attribution modeling for growth teams at startups.",
        "education": "B.Sc Statistics, Mumbai University",
        "previous_companies": ["Lenskart (intern)"],
        "achievements": [
            "Identified funnel drop-off that improved D7 retention by 10%",
            "Built self-serve analytics dashboard for marketing team of 8",
            "A/B tested 5 experiments driving ₹15L in incremental revenue"
        ],
        "expected_salary_inr": 420000,
        "open_to_remote": True,
        "email": "nami.weatheria@gmail.com"
    },
    {
        "id": "C025",
        "name": "Sanji Vinsmoke",
        "title": "Backend Engineer - Node.js & Serverless",
        "location": "Bangalore, India",
        "experience_years": 3,
        "experience_level": "Mid",
        "skills": ["Node.js", "TypeScript", "AWS Lambda", "DynamoDB", "SQS", "API Gateway", "Serverless Framework", "GraphQL"],
        "summary": "Backend engineer with 3 years building serverless architectures and event-driven systems. Built scalable APIs serving hundreds of thousands of requests with sub-100ms p99 latency. AWS certified.",
        "education": "B.Tech IT, NMIT Bangalore",
        "previous_companies": ["Urban Company (intern)", "Slice"],
        "achievements": [
            "Built serverless API handling 100K requests/day at minimal cost",
            "Reduced API latency by 50% using edge caching",
            "AWS Certified Developer Associate"
        ],
        "expected_salary_inr": 800000,
        "open_to_remote": True,
        "email": "sanji.vinsmoke@gmail.com"
    }
]


def get_all_candidates() -> list[dict]:
    """Return all candidate profiles."""
    return CANDIDATES


def get_candidate_by_id(candidate_id: str) -> dict | None:
    """Return a specific candidate by ID."""
    return next((c for c in CANDIDATES if c["id"] == candidate_id), None)


SAMPLE_JDS = [
    {
        "title": "Machine Learning Engineer",
        "text": """We are hiring a Machine Learning Engineer to build and deploy production-grade ML systems.

Role: Machine Learning Engineer
Experience: 1-3 years
Location: Bangalore / Remote

Required Skills:
- Python (expert level)
- TensorFlow or PyTorch
- Scikit-learn, NumPy, Pandas
- SQL and data pipelines
- Model deployment (Flask/FastAPI)
- MLflow or similar experiment tracking

Preferred Skills:
- Hugging Face Transformers
- Kubernetes for ML workloads
- Feature stores (Feast, Tecton)
- Cloud ML services (AWS SageMaker / GCP Vertex AI)

Responsibilities:
- Train, evaluate, and deploy ML models to production
- Collaborate with data engineers to build feature pipelines
- Monitor model performance and retrain as needed
- Work closely with product teams to define ML use cases

Compensation: Rs.7L - Rs.12L + performance bonus"""
    },
    {
        "title": "AI/ML Engineer",
        "text": """Join our AI team to build intelligent systems that power our core product.

Role: AI/ML Engineer
Experience: 1-3 years
Location: Hyderabad / Remote

Required Skills:
- Python
- Deep Learning (CNN, RNN, Transformers)
- PyTorch or TensorFlow
- REST API development with FastAPI
- Version control (Git)
- Basic cloud knowledge (AWS or GCP)

Preferred Skills:
- LLM integration (OpenAI, Gemini, Groq)
- Vector databases (Pinecone, ChromaDB)
- Prompt engineering fundamentals
- Computer Vision (OpenCV, YOLO)

Responsibilities:
- Design and implement AI features end-to-end
- Build data preprocessing and model training pipelines
- Integrate AI capabilities into backend APIs
- Document models and maintain reproducibility

Compensation: Rs.8L - Rs.14L"""
    },
    {
        "title": "Agentic AI Engineer",
        "text": """We are building the next generation of autonomous AI agents and need an Agentic AI Engineer.

Role: Agentic AI Engineer
Experience: 0-3 years
Location: Bangalore / Fully Remote

Required Skills:
- Python
- LangChain or LlamaIndex
- Agent frameworks (AutoGen, CrewAI, LangGraph)
- OpenAI / Anthropic / Groq API integration
- Tool use and function calling with LLMs
- FastAPI for exposing agent endpoints

Preferred Skills:
- Multi-agent orchestration
- Memory systems (short-term and long-term agent memory)
- RAG pipeline design
- Prompt chaining and structured output parsing

Responsibilities:
- Design and build autonomous AI agent workflows
- Integrate agents with external tools (web search, APIs, databases)
- Build evaluation and monitoring frameworks for agents
- Research and prototype new agentic architectures

Why Join Us:
- Work on cutting-edge AI research-to-product problems
- Fully remote, async-first culture
- Learning budget of Rs.50K/year

Compensation: Rs.6L - Rs.11L + equity"""
    },
    {
        "title": "GenAI / LLM Engineer",
        "text": """Fast-growing AI startup looking for a GenAI Engineer to ship AI-powered features.

Role: GenAI / LLM Engineer
Experience: 0-2 years
Location: Remote-first (India)

Required Skills:
- Python
- LangChain or similar orchestration frameworks
- OpenAI API, Gemini, Claude, or Groq
- RAG (Retrieval-Augmented Generation) architectures
- Vector databases: Pinecone, Weaviate, ChromaDB
- FastAPI backend development

Preferred Skills:
- LLM fine-tuning (LoRA, QLoRA with Hugging Face)
- Prompt engineering and structured output techniques
- Evaluation frameworks (RAGAS, TruLens)
- React for lightweight AI frontends

Responsibilities:
- Build LLM-powered products from scratch
- Design and optimize RAG pipelines
- Develop prompt templates and evaluate response quality
- Ship features with fast iteration cycles

Compensation: Rs.5L - Rs.10L + meaningful equity"""
    },
    {
        "title": "Prompt Engineer",
        "text": """We are looking for a Prompt Engineer to design, test, and optimize LLM prompts at scale.

Role: Prompt Engineer
Experience: 0-2 years
Location: Remote

Required Skills:
- Strong understanding of LLM behavior and limitations
- Experience with OpenAI, Anthropic, Gemini, or open-source LLMs
- Prompt design techniques: chain-of-thought, few-shot, zero-shot
- Python scripting for automated prompt testing
- Familiarity with evaluation metrics (BLEU, ROUGE, custom rubrics)

Preferred Skills:
- LangChain / PromptLayer for prompt management
- A/B testing prompts across models
- Structured output generation (JSON mode, function calling)
- Dataset creation and annotation for fine-tuning

Responsibilities:
- Design and iterate prompts for diverse use cases
- Benchmark prompt performance across models
- Collaborate with ML engineers on fine-tuning datasets
- Document and maintain a prompt library

Compensation: Rs.5L - Rs.9L"""
    },
    {
        "title": "Java Full Stack Engineer",
        "text": """We are hiring a Java Full Stack Engineer to build enterprise-grade applications.

Role: Java Full Stack Engineer
Experience: 1-3 years
Location: Noida / Bangalore

Required Skills:
- Java (Spring Boot, Spring MVC)
- REST API development and microservices
- React or Angular for frontend
- MySQL or PostgreSQL
- Maven or Gradle build tools
- Basic Docker knowledge

Preferred Skills:
- Kafka or RabbitMQ
- Redis caching
- JUnit and Mockito for testing
- AWS basics (EC2, S3, RDS)
- Microservices architecture patterns

Responsibilities:
- Build and maintain backend services using Spring Boot
- Develop React-based frontend components
- Write unit and integration tests
- Participate in agile sprints and code reviews

Compensation: Rs.6L - Rs.11L"""
    },
    {
        "title": "Full Stack Engineer - React & Node.js",
        "text": """Looking for a Full Stack Engineer to build and scale our SaaS platform.

Role: Full Stack Engineer
Experience: 1-3 years
Location: Bangalore / Remote

Required Skills:
- React or Next.js (strong)
- Node.js with Express or Fastify
- TypeScript
- PostgreSQL or MongoDB
- REST API and GraphQL

Preferred Skills:
- Redis for caching and sessions
- Docker and basic DevOps
- Tailwind CSS
- AWS or GCP basics

Responsibilities:
- Build end-to-end features across frontend and backend
- Design database schemas and API contracts
- Write clean, tested, and maintainable code
- Collaborate with design and product teams

Compensation: Rs.7L - Rs.13L"""
    },
    {
        "title": "Data Engineer",
        "text": """We need a Data Engineer to build and maintain our data infrastructure.

Role: Data Engineer
Experience: 1-3 years
Location: Pune / Remote

Required Skills:
- Python (Pandas, PySpark)
- Apache Spark or Flink
- SQL (advanced queries, window functions)
- Apache Airflow for orchestration
- AWS (S3, Glue, Redshift) or GCP (BigQuery, Pub/Sub)

Preferred Skills:
- dbt for data transformation
- Kafka for real-time pipelines
- Snowflake or Databricks
- Data quality frameworks (Great Expectations)

Responsibilities:
- Build and maintain batch and real-time data pipelines
- Design data models for analytics and ML teams
- Monitor pipeline health and resolve failures
- Collaborate with data scientists on feature engineering

Compensation: Rs.7L - Rs.12L"""
    },
    {
        "title": "DevOps / Cloud Engineer",
        "text": """We are looking for a DevOps Engineer to scale our cloud infrastructure.

Role: DevOps / Cloud Engineer
Experience: 1-3 years
Location: Bangalore / Remote

Required Skills:
- AWS or GCP (core services: EC2, S3, RDS, Lambda or equivalents)
- Docker and Kubernetes
- Terraform for infrastructure as code
- CI/CD pipelines (GitHub Actions, Jenkins, or GitLab CI)
- Linux administration and shell scripting

Preferred Skills:
- Prometheus and Grafana for monitoring
- Helm charts for Kubernetes deployments
- Cost optimization strategies
- Security best practices (IAM, VPC, Secrets Manager)

Responsibilities:
- Design and manage cloud infrastructure
- Build and maintain CI/CD pipelines
- Implement monitoring, alerting, and on-call runbooks
- Automate manual operational tasks

Compensation: Rs.7L - Rs.13L"""
    },
    {
        "title": "Data Scientist - NLP",
        "text": """Join our NLP team to build text intelligence products used by millions.

Role: Data Scientist - NLP
Experience: 1-3 years
Location: Hyderabad / Remote

Required Skills:
- Python
- NLP libraries: NLTK, spaCy, Hugging Face
- BERT, RoBERTa, or similar transformer models
- Text classification, NER, sentiment analysis
- SQL for data extraction
- Scikit-learn for classical ML baselines

Preferred Skills:
- LangChain and RAG pipelines
- Multilingual NLP (Hindi, Telugu, Tamil)
- FastAPI for model serving
- Experiment tracking with MLflow or W&B

Responsibilities:
- Build and fine-tune NLP models for production
- Develop text classification and extraction pipelines
- Evaluate model performance and iterate
- Collaborate with product and engineering teams

Compensation: Rs.7L - Rs.11L"""
    },
    {
        "title": "Android Engineer",
        "text": """We are building a consumer super-app and need an Android Engineer to join our mobile team.

Role: Android Engineer
Experience: 1-3 years
Location: Delhi / Remote

Required Skills:
- Kotlin (strong)
- Jetpack Compose for modern UI
- Android SDK, Fragments, Navigation Component
- Room Database, Retrofit, Coroutines
- Firebase (Crashlytics, Analytics, FCM)

Preferred Skills:
- Hilt for dependency injection
- WorkManager for background tasks
- Unit testing with JUnit and Mockito
- Performance profiling (Android Profiler)

Responsibilities:
- Build new features and maintain existing Android app
- Write clean, maintainable Kotlin code
- Optimize app performance and reduce crash rates
- Collaborate with backend and design teams

Compensation: Rs.6L - Rs.11L"""
    },
    {
        "title": "Frontend Engineer - React & Next.js",
        "text": """We need a Frontend Engineer obsessed with performance and beautiful UX.

Role: Frontend Engineer
Experience: 1-3 years
Location: Mumbai / Remote

Required Skills:
- React (hooks, context, lazy loading)
- Next.js (App Router, SSR, SSG)
- TypeScript
- Tailwind CSS or CSS-in-JS
- REST API integration

Preferred Skills:
- Framer Motion for animations
- Storybook for component documentation
- Jest and React Testing Library
- GraphQL with Apollo or urql
- Web accessibility (WCAG 2.1)

Responsibilities:
- Build responsive, accessible, and fast UI components
- Implement designs from Figma pixel-perfectly
- Optimize Core Web Vitals (LCP, CLS, FID)
- Write unit tests for critical UI components

Compensation: Rs.6L - Rs.12L"""
    }
]
