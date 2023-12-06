FROM apache/nifi:1.13.0
COPY ./conf/core-site.xml /opt/nifi/conf/
COPY ./conf/hdfs-site.xml /opt/nifi/conf/
COPY --chown=nifi:nifi flow.xml.gz /opt/nifi/nifi-current/conf/
EXPOSE 8080
