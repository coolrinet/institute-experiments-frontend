import { Flex, Loader } from '@mantine/core';

function PageLoader() {
  return (
    <Flex w='100%' h='100vh' align='center' justify='center' direction='column'>
      <Loader size='xl' />
    </Flex>
  );
}
export default PageLoader;
