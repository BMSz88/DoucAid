from setuptools import setup, find_packages

# Read the contents of README.md for long description
with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='documentation-summarizer',
    version='0.1.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='An AI-powered documentation summarization tool',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/documentation-summarizer',
    packages=find_packages(),
    install_requires=[
        'torch>=1.9.0',
        'transformers>=4.10.0',
        'numpy>=1.21.0',
        'pandas>=1.3.0',
        'scikit-learn>=0.24.0',
        'pyyaml>=5.4.0',
        'sentencepiece>=0.1.96',
    ],
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    python_requires='>=3.9',
    extras_require={
        'dev': [
            'pytest',
            'jupyter',
            'matplotlib',
            'seaborn',
        ],
        'docs': [
            'sphinx',
            'sphinx_rtd_theme',
        ],
    },
    entry_points={
        'console_scripts': [
            'doc-summarizer=src.inference:main',
        ],
    },
    keywords='nlp ai summarization documentation machine-learning',
)