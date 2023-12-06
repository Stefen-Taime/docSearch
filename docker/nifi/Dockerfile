FROM apache/nifi:1.13.0
COPY ./conf/core-site.xml /opt/nifi/conf/
COPY ./conf/hdfs-site.xml /opt/nifi/conf/
COPY --chown=nifi:nifi flow.xml.gz /opt/nifi/nifi-current/conf/
COPY ./templates/docSeachV2.xml /opt/nifi/nifi-current/conf/templates
EXPOSE 8080
